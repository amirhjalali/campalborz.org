import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { securityService } from "../services/security";
import { AuditLogger } from "../middleware/security";

// Security management schemas
const PasswordValidationSchema = z.object({
  password: z.string(),
});

const SecurityScanSchema = z.object({
  includeVulnerabilities: z.boolean().optional().default(true),
  includeMetrics: z.boolean().optional().default(true),
});

const SecurityMetricsSchema = z.object({
  timeRange: z.enum(['day', 'week', 'month']).optional().default('day'),
});

const AuditLogFiltersSchema = z.object({
  userId: z.string().optional(),
  action: z.string().optional(),
  severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  limit: z.number().min(1).max(1000).optional().default(100),
  offset: z.number().min(0).optional().default(0),
});

const UpdateSecurityConfigSchema = z.object({
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(50).optional(),
    requireUppercase: z.boolean().optional(),
    requireLowercase: z.boolean().optional(),
    requireNumbers: z.boolean().optional(),
    requireSpecialChars: z.boolean().optional(),
    preventReuse: z.number().min(0).max(20).optional(),
  }).optional(),
  sessionManagement: z.object({
    maxConcurrentSessions: z.number().min(1).max(50).optional(),
    sessionTimeout: z.number().min(300).max(604800).optional(), // 5 minutes to 7 days
    refreshTokenExpiry: z.number().min(3600).max(2592000).optional(), // 1 hour to 30 days
  }).optional(),
  twoFactorAuth: z.object({
    enabled: z.boolean().optional(),
    methods: z.array(z.enum(['totp', 'sms', 'email'])).optional(),
    backupCodes: z.number().min(5).max(20).optional(),
  }).optional(),
});

export const securityRouter = router({
  // Get security dashboard overview
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view security dashboard
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view security dashboard",
        });
      }

      try {
        // Get security scan results
        const scanResults = await securityService.scanForVulnerabilities(ctx.tenant.id);
        
        // Get recent security metrics
        const metrics = await securityService.getSecurityMetrics(ctx.tenant.id, 'day');
        
        // Get security configuration
        const config = await securityService.getSecurityConfig(ctx.tenant.id);

        // Log access to security dashboard
        await AuditLogger.log({
          tenantId: ctx.tenant.id,
          userId: ctx.user.id,
          action: 'VIEW_SECURITY_DASHBOARD',
          resource: 'security',
          ip: '127.0.0.1', // Would be extracted from request
          userAgent: 'unknown', // Would be extracted from request
          severity: 'info',
        });

        return {
          securityScore: scanResults.score,
          vulnerabilities: scanResults.vulnerabilities,
          metrics: {
            totalEvents: metrics.totalEvents,
            criticalEvents: metrics.eventsBySeverity['CRITICAL'] || 0,
            errorEvents: metrics.eventsBySeverity['ERROR'] || 0,
            warningEvents: metrics.eventsBySeverity['WARNING'] || 0,
          },
          config: {
            twoFactorEnabled: config.twoFactorAuth.enabled,
            passwordPolicyStrength: this.calculatePasswordPolicyStrength(config.passwordPolicy),
            sessionTimeoutHours: config.sessionManagement.sessionTimeout / 3600,
          },
          lastScan: scanResults.lastScan,
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Security dashboard error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve security dashboard",
        });
      }
    }),

  // Validate password strength
  validatePassword: protectedProcedure
    .input(PasswordValidationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const validation = await securityService.validatePassword(input.password, ctx.tenant.id);
        
        return {
          valid: validation.valid,
          errors: validation.errors,
          strength: validation.strength,
          checkedAt: new Date(),
        };
      } catch (error) {
        console.error("Password validation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate password",
        });
      }
    }),

  // Run security scan
  runSecurityScan: protectedProcedure
    .input(SecurityScanSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can run security scans
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to run security scans",
        });
      }

      try {
        // Log the security scan
        await AuditLogger.log({
          tenantId: ctx.tenant.id,
          userId: ctx.user.id,
          action: 'RUN_SECURITY_SCAN',
          resource: 'security',
          ip: '127.0.0.1', // Would be extracted from request
          userAgent: 'unknown', // Would be extracted from request
          severity: 'info',
        });

        const scanResults = await securityService.scanForVulnerabilities(ctx.tenant.id);
        
        let metrics;
        if (input.includeMetrics) {
          metrics = await securityService.getSecurityMetrics(ctx.tenant.id, 'week');
        }

        return {
          success: true,
          score: scanResults.score,
          vulnerabilities: input.includeVulnerabilities ? scanResults.vulnerabilities : undefined,
          metrics: metrics,
          scanTime: scanResults.lastScan,
          message: `Security scan completed. Score: ${scanResults.score}/100`,
        };
      } catch (error) {
        console.error("Security scan error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to run security scan",
        });
      }
    }),

  // Get security metrics
  getMetrics: protectedProcedure
    .input(SecurityMetricsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view security metrics
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view security metrics",
        });
      }

      try {
        const metrics = await securityService.getSecurityMetrics(ctx.tenant.id, input.timeRange);
        
        return {
          ...metrics,
          timeRange: input.timeRange,
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Security metrics error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve security metrics",
        });
      }
    }),

  // Get audit logs
  getAuditLogs: protectedProcedure
    .input(AuditLogFiltersSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view audit logs
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view audit logs",
        });
      }

      try {
        // Build where clause
        const where: any = {
          tenantId: ctx.tenant.id,
        };

        if (input.userId) {
          where.userId = input.userId;
        }

        if (input.action) {
          where.action = {
            contains: input.action,
            mode: 'insensitive',
          };
        }

        if (input.severity) {
          where.severity = input.severity;
        }

        if (input.startDate || input.endDate) {
          where.timestamp = {};
          if (input.startDate) {
            where.timestamp.gte = input.startDate;
          }
          if (input.endDate) {
            where.timestamp.lte = input.endDate;
          }
        }

        // Get audit logs
        const [logs, total] = await Promise.all([
          prisma.auditLog.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              timestamp: 'desc',
            },
            take: input.limit,
            skip: input.offset,
          }),
          prisma.auditLog.count({ where }),
        ]);

        return {
          logs,
          total,
          hasMore: total > (input.offset + input.limit),
          pagination: {
            limit: input.limit,
            offset: input.offset,
            total,
          },
        };
      } catch (error) {
        console.error("Audit logs error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve audit logs",
        });
      }
    }),

  // Get security configuration
  getConfig: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view security configuration
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view security configuration",
        });
      }

      try {
        const config = await securityService.getSecurityConfig(ctx.tenant.id);
        
        return {
          config,
          recommendations: [
            {
              type: 'info',
              title: 'Enable Two-Factor Authentication',
              description: 'Add an extra layer of security to all user accounts',
              enabled: config.twoFactorAuth.enabled,
            },
            {
              type: 'info',
              title: 'Strong Password Policy',
              description: 'Ensure users create secure passwords',
              enabled: config.passwordPolicy.minLength >= 8 && 
                       config.passwordPolicy.requireSpecialChars,
            },
            {
              type: 'info',
              title: 'Session Management',
              description: 'Configure appropriate session timeouts',
              enabled: config.sessionManagement.sessionTimeout <= 86400, // 24 hours
            },
          ],
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Security config error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve security configuration",
        });
      }
    }),

  // Generate TOTP secret for 2FA setup
  generateTOTPSecret: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const totpData = await securityService.generateTOTPSecret();
        
        // Log TOTP setup initiation
        await AuditLogger.log({
          tenantId: ctx.tenant.id,
          userId: ctx.user.id,
          action: 'TOTP_SETUP_INITIATED',
          resource: 'security',
          ip: '127.0.0.1',
          userAgent: 'unknown',
          severity: 'info',
        });

        return {
          secret: totpData.secret,
          qrCode: totpData.qrCode,
          backupCodes: totpData.backupCodes,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("TOTP generation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate TOTP secret",
        });
      }
    }),

  // Verify TOTP token
  verifyTOTP: protectedProcedure
    .input(z.object({
      token: z.string().length(6),
      secret: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const isValid = await securityService.verifyTOTP(input.token, input.secret);
        
        // Log TOTP verification attempt
        await AuditLogger.log({
          tenantId: ctx.tenant.id,
          userId: ctx.user.id,
          action: isValid ? 'TOTP_VERIFICATION_SUCCESS' : 'TOTP_VERIFICATION_FAILED',
          resource: 'security',
          ip: '127.0.0.1',
          userAgent: 'unknown',
          severity: isValid ? 'info' : 'warning',
        });

        return {
          valid: isValid,
          verifiedAt: new Date(),
        };
      } catch (error) {
        console.error("TOTP verification error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to verify TOTP token",
        });
      }
    }),

  // Get security alerts/incidents
  getSecurityAlerts: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view security alerts
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view security alerts",
        });
      }

      try {
        // Get recent critical and error events
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const alerts = await prisma.auditLog.findMany({
          where: {
            tenantId: ctx.tenant.id,
            severity: {
              in: ['ERROR', 'CRITICAL'],
            },
            timestamp: {
              gte: oneDayAgo,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 50,
        });

        return {
          alerts: alerts.map(alert => ({
            id: alert.id,
            action: alert.action,
            severity: alert.severity,
            ip: alert.ip,
            user: alert.user,
            metadata: alert.metadata,
            timestamp: alert.timestamp,
          })),
          count: alerts.length,
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Security alerts error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve security alerts",
        });
      }
    }),

  // Helper method to calculate password policy strength
  calculatePasswordPolicyStrength: (policy: any): 'weak' | 'medium' | 'strong' => {
    let score = 0;
    
    if (policy.minLength >= 8) score++;
    if (policy.minLength >= 12) score++;
    if (policy.requireUppercase) score++;
    if (policy.requireLowercase) score++;
    if (policy.requireNumbers) score++;
    if (policy.requireSpecialChars) score++;
    if (policy.preventReuse >= 3) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  },
});