import { prisma } from '../lib/prisma';
import { cacheService } from './cache';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number; // Number of previous passwords to prevent reuse
  };
  sessionManagement: {
    maxConcurrentSessions: number;
    sessionTimeout: number; // in seconds
    refreshTokenExpiry: number; // in seconds
  };
  twoFactorAuth: {
    enabled: boolean;
    methods: ('totp' | 'sms' | 'email')[];
    backupCodes: number;
  };
  encryption: {
    algorithm: string;
    keySize: number;
    ivSize: number;
  };
}

class SecurityService {
  private defaultConfig: SecurityConfig = {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
    },
    sessionManagement: {
      maxConcurrentSessions: 5,
      sessionTimeout: 86400, // 24 hours
      refreshTokenExpiry: 604800, // 7 days
    },
    twoFactorAuth: {
      enabled: false,
      methods: ['totp'],
      backupCodes: 10,
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keySize: 32,
      ivSize: 16,
    },
  };

  async getSecurityConfig(tenantId: string): Promise<SecurityConfig> {
    const cacheKey = `security_config:${tenantId}`;
    
    return cacheService.cached(cacheKey, async () => {
      // In a real implementation, this would fetch tenant-specific security settings
      return this.defaultConfig;
    }, { ttl: 3600 }); // Cache for 1 hour
  }

  async validatePassword(password: string, tenantId?: string): Promise<{
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong' | 'very_strong';
  }> {
    const config = await this.getSecurityConfig(tenantId || 'default');
    const policy = config.passwordPolicy;
    const errors: string[] = [];

    // Length check
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    // Character requirements
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Calculate password strength
    let strengthScore = 0;
    if (password.length >= 8) strengthScore++;
    if (password.length >= 12) strengthScore++;
    if (/[A-Z]/.test(password)) strengthScore++;
    if (/[a-z]/.test(password)) strengthScore++;
    if (/\d/.test(password)) strengthScore++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++;
    if (password.length >= 16) strengthScore++;

    let strength: 'weak' | 'medium' | 'strong' | 'very_strong';
    if (strengthScore <= 2) strength = 'weak';
    else if (strengthScore <= 4) strength = 'medium';
    else if (strengthScore <= 6) strength = 'strong';
    else strength = 'very_strong';

    return {
      valid: errors.length === 0,
      errors,
      strength,
    };
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateSecureToken(length: number = 32): Promise<string> {
    return crypto.randomBytes(length).toString('hex');
  }

  async generateJWT(payload: any, expiresIn: string | number = '24h'): Promise<string> {
    const secret = process.env.JWT_SECRET || 'default-secret';
    return jwt.sign(payload, secret, { expiresIn: expiresIn as string });
  }

  async verifyJWT(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
    try {
      const secret = process.env.JWT_SECRET || 'default-secret';
      const payload = jwt.verify(token, secret);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }

  async encryptData(data: string, key?: string): Promise<{
    encrypted: string;
    iv: string;
    tag: string;
  }> {
    const encryptionKey = key || process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    const keyBuffer = typeof encryptionKey === 'string' ? Buffer.from(encryptionKey.slice(0, 32)) : encryptionKey;
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  async decryptData(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }, key?: string): Promise<string> {
    const encryptionKey = key || process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }

    const keyBuffer = typeof encryptionKey === 'string' ? Buffer.from(encryptionKey.slice(0, 32)) : encryptionKey;
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  async generateTOTPSecret(): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    // Generate a hex secret for TOTP (base32 not natively supported)
    const secret = crypto.randomBytes(20).toString('hex').toUpperCase();
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    // Generate QR code URL (would typically use a QR code library)
    const qrCode = `otpauth://totp/Camp%20Platform?secret=${secret}&issuer=Camp%20Platform`;

    return {
      secret,
      qrCode,
      backupCodes,
    };
  }

  async verifyTOTP(token: string, secret: string): Promise<boolean> {
    // TOTP verification implementation would go here
    // For now, return a mock verification
    return token.length === 6 && /^\d+$/.test(token);
  }

  async logSecurityEvent(event: {
    tenantId?: string;
    userId?: string;
    action: string;
    ip: string;
    userAgent: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    metadata?: Record<string, any>;
  }) {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: event.tenantId,
          userId: event.userId,
          action: event.action,
          resource: 'security',
          ip: event.ip,
          userAgent: event.userAgent,
          metadata: event.metadata || {},
          severity: event.severity.toUpperCase() as any,
          timestamp: new Date(),
        },
      });

      // Real-time security monitoring
      if (event.severity === 'critical') {
        await this.triggerSecurityAlert(event);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private async triggerSecurityAlert(event: any) {
    // Send immediate alerts for critical security events
    console.log(`🚨 CRITICAL SECURITY ALERT: ${event.action} from ${event.ip}`);
    
    // In a real implementation, this would:
    // - Send notifications to security team
    // - Potentially auto-block the IP
    // - Trigger incident response procedures
  }

  async scanForVulnerabilities(tenantId: string): Promise<{
    vulnerabilities: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      recommendation: string;
      affected: string;
    }>;
    score: number; // Security score out of 100
    lastScan: Date;
  }> {
    const vulnerabilities = [];
    let score = 100;

    // Check password policies
    const config = await this.getSecurityConfig(tenantId);
    if (config.passwordPolicy.minLength < 8) {
      vulnerabilities.push({
        type: 'WEAK_PASSWORD_POLICY',
        severity: 'medium' as const,
        description: 'Password minimum length is below recommended 8 characters',
        recommendation: 'Increase minimum password length to at least 8 characters',
        affected: 'Authentication system',
      });
      score -= 10;
    }

    // Check for 2FA
    if (!config.twoFactorAuth.enabled) {
      vulnerabilities.push({
        type: 'NO_2FA',
        severity: 'high' as const,
        description: 'Two-factor authentication is not enabled',
        recommendation: 'Enable two-factor authentication for enhanced security',
        affected: 'All user accounts',
      });
      score -= 20;
    }

    // Check for recent security incidents
    const recentIncidents = await this.getRecentSecurityIncidents(tenantId);
    if (recentIncidents > 5) {
      vulnerabilities.push({
        type: 'HIGH_INCIDENT_COUNT',
        severity: 'medium' as const,
        description: `${recentIncidents} security incidents in the last 24 hours`,
        recommendation: 'Review and address recent security incidents',
        affected: 'Overall security posture',
      });
      score -= 15;
    }

    // Check encryption settings
    if (!process.env.ENCRYPTION_KEY) {
      vulnerabilities.push({
        type: 'NO_ENCRYPTION_KEY',
        severity: 'critical' as const,
        description: 'No encryption key configured for sensitive data',
        recommendation: 'Configure encryption key for data protection',
        affected: 'Data storage and transmission',
      });
      score -= 30;
    }

    return {
      vulnerabilities,
      score: Math.max(0, score),
      lastScan: new Date(),
    };
  }

  private async getRecentSecurityIncidents(tenantId: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    try {
      return await prisma.auditLog.count({
        where: {
          tenantId,
          severity: {
            in: ['ERROR', 'CRITICAL'],
          },
          timestamp: {
            gte: oneDayAgo,
          },
        },
      });
    } catch (error) {
      console.error('Failed to get recent security incidents:', error);
      return 0;
    }
  }

  async getSecurityMetrics(tenantId: string, timeRange: 'day' | 'week' | 'month' = 'day'): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    topIPs: Array<{ ip: string; count: number }>;
    timeline: Array<{ timestamp: Date; count: number; severity: string }>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    try {
      // Get all audit logs in the time range
      const logs = await prisma.auditLog.findMany({
        where: {
          tenantId,
          timestamp: {
            gte: startDate,
          },
        },
        select: {
          action: true,
          severity: true,
          ip: true,
          timestamp: true,
        },
      });

      // Calculate metrics
      const totalEvents = logs.length;
      
      const eventsByType = logs.reduce((acc: Record<string, number>, log: any) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const eventsBySeverity = logs.reduce((acc: Record<string, number>, log: any) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ipCounts = logs.reduce((acc: Record<string, number>, log: any) => {
        acc[log.ip] = (acc[log.ip] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topIPs = Object.entries(ipCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count: count as number }));

      // Create timeline (group by hour)
      const timeline = logs.reduce((acc: Array<{ timestamp: Date; count: number; severity: string }>, log: any) => {
        const hour = new Date(log.timestamp);
        hour.setMinutes(0, 0, 0);
        const key = hour.toISOString();

        const existing = acc.find((item: { timestamp: Date; count: number; severity: string }) => item.timestamp.toISOString() === key);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            timestamp: hour,
            count: 1,
            severity: log.severity,
          });
        }

        return acc;
      }, [] as Array<{ timestamp: Date; count: number; severity: string }>);

      return {
        totalEvents,
        eventsByType,
        eventsBySeverity,
        topIPs,
        timeline: timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()),
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsBySeverity: {},
        topIPs: [],
        timeline: [],
      };
    }
  }
}

export const securityService = new SecurityService();