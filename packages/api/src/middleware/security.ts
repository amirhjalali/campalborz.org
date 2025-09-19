import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { TRPCError } from '@trpc/server';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';
import { cacheService } from '../services/cache';

// Rate limiting configurations
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || 'Too many requests, please try again later.',
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: options.message || 'Too many requests, please try again later.',
        retryAfter: Math.round(options.windowMs / 1000),
      });
    },
  });
};

// Different rate limits for different endpoints
export const rateLimiters = {
  // General API rate limiting
  general: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per 15 minutes
    message: 'Too many API requests, please try again later.',
  }),

  // Authentication endpoints (stricter)
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  }),

  // Password reset (very strict)
  passwordReset: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: 'Too many password reset attempts, please try again later.',
  }),

  // File uploads
  upload: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 uploads per 15 minutes
    message: 'Too many file upload requests, please try again later.',
  }),

  // Search endpoints
  search: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // 60 searches per minute
    message: 'Too many search requests, please try again later.',
  }),

  // API key based rate limiting
  apiKey: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // Default 1000 requests per hour for API keys
    keyGenerator: (req) => {
      const apiKey = req.headers['x-api-key'] as string;
      return apiKey ? `api:${crypto.createHash('sha256').update(apiKey).digest('hex')}` : req.ip;
    },
    message: 'API rate limit exceeded, check your plan limits.',
  }),
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some frontend frameworks
        "https://js.stripe.com",
        "https://checkout.stripe.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "blob:",
      ],
      connectSrc: [
        "'self'",
        "https://api.stripe.com",
        "https://*.amazonaws.com", // For S3 uploads
      ],
      mediaSrc: ["'self'", "blob:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for better compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove potential XSS payloads from query parameters
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      req.query[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
  }

  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remove potential XSS payloads
      sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// IP whitelist/blacklist middleware
export const ipFilter = (options: {
  whitelist?: string[];
  blacklist?: string[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (options.blacklist && options.blacklist.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'IP_BLACKLISTED',
      });
    }

    if (options.whitelist && !options.whitelist.includes(clientIP)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'IP_NOT_WHITELISTED',
      });
    }

    next();
  };
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.campalborz.org')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Tenant-ID',
  ],
};

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!validation.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validation.error.issues,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Request validation error',
        message: error.message,
      });
    }
  };
};

// Audit logging
interface AuditLogEntry {
  tenantId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class AuditLogger {
  static async log(entry: Omit<AuditLogEntry, 'timestamp'>) {
    try {
      const auditEntry = {
        ...entry,
        timestamp: new Date(),
      };

      // Store in database
      await prisma.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          ip: entry.ip,
          userAgent: entry.userAgent,
          metadata: entry.metadata || {},
          severity: entry.severity,
          timestamp: auditEntry.timestamp,
        },
      });

      // Log to console for immediate monitoring
      console.log(`[AUDIT] ${entry.severity.toUpperCase()}: ${entry.action} on ${entry.resource} by ${entry.userId || 'anonymous'} from ${entry.ip}`);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  static middleware(action: string, resource: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Log the request
      AuditLogger.log({
        tenantId: (req as any).tenant?.id,
        userId: (req as any).user?.id,
        action,
        resource,
        ip: req.ip,
        userAgent: req.get('User-Agent') || 'unknown',
        metadata: {
          method: req.method,
          url: req.url,
          body: req.method !== 'GET' ? req.body : undefined,
        },
        severity: 'info',
      });

      next();
    };
  }
}

// Security monitoring and alerting
export class SecurityMonitor {
  private static suspiciousPatterns = [
    /(<script[\s\S]*?>[\s\S]*?<\/script>)/gi, // XSS attempts
    /(union\s+select|drop\s+table|insert\s+into)/gi, // SQL injection
    /(\.\.\/|\.\.\\)/g, // Path traversal
    /(\$\{.*\}|<%.*%>)/g, // Template injection
  ];

  static async checkForThreats(req: Request): Promise<{
    isThreat: boolean;
    threats: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const threats: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check request content for suspicious patterns
    const content = JSON.stringify({
      url: req.url,
      query: req.query,
      body: req.body,
      headers: req.headers,
    });

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(content)) {
        threats.push(pattern.source);
        severity = 'high';
      }
    }

    // Check for brute force attempts
    const clientIP = req.ip;
    const recentAttempts = await this.getRecentFailedAttempts(clientIP);
    
    if (recentAttempts > 20) {
      threats.push('Potential brute force attack');
      severity = 'critical';
    } else if (recentAttempts > 10) {
      threats.push('Suspicious login activity');
      severity = 'medium';
    }

    // Check request rate
    const requestRate = await this.getRequestRate(clientIP);
    if (requestRate > 100) { // More than 100 requests per minute
      threats.push('High request rate detected');
      if (severity === 'low') severity = 'medium';
    }

    return {
      isThreat: threats.length > 0,
      threats,
      severity,
    };
  }

  private static async getRecentFailedAttempts(ip: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    try {
      const count = await prisma.auditLog.count({
        where: {
          ip,
          action: {
            in: ['LOGIN_FAILED', 'AUTH_FAILED'],
          },
          timestamp: {
            gte: oneHourAgo,
          },
        },
      });
      
      return count;
    } catch (error) {
      console.error('Failed to get failed attempts count:', error);
      return 0;
    }
  }

  private static async getRequestRate(ip: string): Promise<number> {
    const cacheKey = `request_rate:${ip}`;
    
    try {
      const cached = await cacheService.get<number>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const count = await prisma.auditLog.count({
        where: {
          ip,
          timestamp: {
            gte: oneMinuteAgo,
          },
        },
      });

      await cacheService.set(cacheKey, count, { ttl: 60 });
      return count;
    } catch (error) {
      console.error('Failed to get request rate:', error);
      return 0;
    }
  }

  static async handleThreat(
    req: Request,
    res: Response,
    threat: { threats: string[]; severity: string }
  ) {
    // Log the security incident
    await AuditLogger.log({
      tenantId: (req as any).tenant?.id,
      userId: (req as any).user?.id,
      action: 'SECURITY_THREAT_DETECTED',
      resource: 'security',
      ip: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      metadata: {
        threats: threat.threats,
        severity: threat.severity,
        url: req.url,
        method: req.method,
      },
      severity: threat.severity as any,
    });

    // Block critical threats immediately
    if (threat.severity === 'critical') {
      return res.status(403).json({
        error: 'Security threat detected',
        code: 'SECURITY_THREAT_BLOCKED',
      });
    }

    // For high severity, add delay
    if (threat.severity === 'high') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
  }
}

// Security middleware that combines threat detection with request processing
export const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for security threats
    const threatCheck = await SecurityMonitor.checkForThreats(req);
    
    if (threatCheck.isThreat) {
      await SecurityMonitor.handleThreat(req, res, threatCheck);
      
      // Block critical threats
      if (threatCheck.severity === 'critical') {
        return;
      }
    }

    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    next(); // Continue processing to avoid breaking the application
  }
};

// JWT token validation for tRPC procedures
export const validateJWTToken = (token: string): { valid: boolean; payload?: any; error?: string } => {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' };
    }

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace(/^Bearer\s+/, '');
    
    // Verify JWT token (implementation would depend on your JWT library)
    // For now, return a mock validation
    const isValid = cleanToken.length > 20; // Simple validation
    
    if (isValid) {
      return {
        valid: true,
        payload: {
          userId: 'mock-user-id',
          tenantId: 'mock-tenant-id',
          role: 'user',
        },
      };
    } else {
      return { valid: false, error: 'Invalid token format' };
    }
  } catch (error) {
    return { valid: false, error: 'Token validation failed' };
  }
};