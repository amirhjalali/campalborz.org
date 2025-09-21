import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { AdvancedSecurityService } from "../services/advancedSecurity";

const advancedSecurityService = new AdvancedSecurityService();

const policyConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  policyType: z.enum(['access_control', 'data_protection', 'authentication', 'authorization', 'encryption', 'network_security', 'compliance', 'privacy', 'incident_response', 'vulnerability_management', 'threat_detection', 'custom']),
  rules: z.array(z.any()).default([]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  actions: z.array(z.any()).default([]),
  exemptions: z.array(z.any()).default([]),
  metadata: z.any().default({})
});

const scanConfigSchema = z.object({
  scanType: z.enum(['vulnerability_scan', 'penetration_test', 'compliance_audit', 'code_analysis', 'dependency_check', 'network_scan', 'web_app_scan', 'infrastructure_scan', 'custom']),
  target: z.string(),
  config: z.any().default({}),
  scheduledBy: z.string().optional()
});

const incidentConfigSchema = z.object({
  title: z.string(),
  description: z.string(),
  incidentType: z.enum(['data_breach', 'malware_infection', 'unauthorized_access', 'denial_of_service', 'phishing_attack', 'insider_threat', 'system_compromise', 'compliance_violation', 'privacy_violation', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affectedUsers: z.array(z.string()).default([]),
  affectedSystems: z.array(z.string()).default([])
});

const alertConfigSchema = z.object({
  alertType: z.enum(['intrusion_detection', 'malware_detection', 'anomaly_detection', 'policy_violation', 'system_failure', 'compliance_alert', 'threat_intelligence', 'custom']),
  title: z.string(),
  message: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  source: z.string(),
  metadata: z.any().default({})
});

const threatConfigSchema = z.object({
  threatType: z.enum(['malware', 'phishing', 'botnet', 'c2_server', 'malicious_ip', 'suspicious_domain', 'vulnerability', 'exploit', 'indicator', 'custom']),
  source: z.string(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  indicators: z.array(z.any()).default([]),
  references: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
});

export const advancedSecurityRouter = router({
  // Policy Management
  createPolicy: protectedProcedure
    .input(policyConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.createPolicy(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getPolicies: protectedProcedure
    .input(z.object({
      policyType: z.string().optional(),
      isActive: z.boolean().optional(),
      severity: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getPolicies(
        ctx.user.tenantId,
        input
      );
    }),

  evaluatePolicy: protectedProcedure
    .input(z.object({
      policyId: z.string(),
      context: z.any()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.evaluatePolicy(
        ctx.user.tenantId,
        input.policyId,
        { ...input.context, userId: ctx.user.id }
      );
    }),

  // Violation Management
  getViolations: protectedProcedure
    .input(z.object({
      severity: z.string().optional(),
      resolved: z.boolean().optional(),
      userId: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getViolations(
        ctx.user.tenantId,
        input
      );
    }),

  resolveViolation: protectedProcedure
    .input(z.object({
      violationId: z.string(),
      resolution: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.recordViolation(
        ctx.user.tenantId,
        {
          policyId: input.violationId,
          violationType: 'resolution',
          severity: 'low',
          description: input.resolution || 'Violation resolved',
          userId: ctx.user.id
        }
      );
    }),

  // Security Scanning
  createScan: protectedProcedure
    .input(scanConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.createScan(
        ctx.user.tenantId,
        { ...input, scheduledBy: ctx.user.id }
      );
    }),

  getScans: protectedProcedure
    .input(z.object({
      scanType: z.string().optional(),
      status: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      const where: any = { tenantId: ctx.user.tenantId };
      
      if (input.scanType) where.scanType = input.scanType;
      if (input.status) where.status = input.status;
      if (input.startTime || input.endTime) {
        where.startedAt = {};
        if (input.startTime) where.startedAt.gte = input.startTime;
        if (input.endTime) where.startedAt.lte = input.endTime;
      }

      return {
        scans: await advancedSecurityService.getPolicies(ctx.user.tenantId, input),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: 0,
          pages: 0
        }
      };
    }),

  // Incident Management
  createIncident: protectedProcedure
    .input(incidentConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.createIncident(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  updateIncident: protectedProcedure
    .input(z.object({
      incidentId: z.string(),
      updates: z.object({
        status: z.enum(['reported', 'investigating', 'contained', 'eradicated', 'recovered', 'closed']).optional(),
        assignedTo: z.string().optional(),
        resolution: z.string().optional(),
        lessons: z.string().optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.updateIncident(
        ctx.user.tenantId,
        input.incidentId,
        input.updates,
        ctx.user.id
      );
    }),

  getIncidents: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      severity: z.string().optional(),
      incidentType: z.string().optional(),
      assignedTo: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getIncidents(
        ctx.user.tenantId,
        input
      );
    }),

  // Alert Management
  createAlert: protectedProcedure
    .input(alertConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.createAlert(
        ctx.user.tenantId,
        input
      );
    }),

  acknowledgeAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.acknowledgeAlert(
        ctx.user.tenantId,
        input.alertId,
        ctx.user.id
      );
    }),

  resolveAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.resolveAlert(
        ctx.user.tenantId,
        input.alertId,
        ctx.user.id
      );
    }),

  getAlerts: protectedProcedure
    .input(z.object({
      severity: z.string().optional(),
      alertType: z.string().optional(),
      acknowledged: z.boolean().optional(),
      resolved: z.boolean().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getAlerts(
        ctx.user.tenantId,
        input
      );
    }),

  // Audit Logging
  logAuditEvent: protectedProcedure
    .input(z.object({
      action: z.string(),
      resource: z.string(),
      resourceId: z.string().optional(),
      outcome: z.enum(['success', 'failure', 'denied', 'warning', 'error']),
      details: z.any().optional(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      sessionId: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.logAuditEvent(
        ctx.user.tenantId,
        {
          ...input,
          userId: ctx.user.id
        }
      );
    }),

  getAuditLogs: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
      action: z.string().optional(),
      resource: z.string().optional(),
      outcome: z.string().optional(),
      minRiskScore: z.number().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getAuditLogs(
        ctx.user.tenantId,
        input
      );
    }),

  // Threat Intelligence
  addThreatIntelligence: protectedProcedure
    .input(threatConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.addThreatIntelligence(
        ctx.user.tenantId,
        input
      );
    }),

  getThreatIntelligence: protectedProcedure
    .input(z.object({
      threatType: z.string().optional(),
      severity: z.string().optional(),
      isActive: z.boolean().optional(),
      minConfidence: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getThreatIntelligence(
        ctx.user.tenantId,
        input
      );
    }),

  checkThreatIndicator: protectedProcedure
    .input(z.object({ indicator: z.string() }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.checkThreatIndicator(
        ctx.user.tenantId,
        input.indicator
      );
    }),

  // Security Baseline and Compliance
  createBaseline: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      framework: z.string(),
      version: z.string(),
      controls: z.array(z.any())
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.createBaseline(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  performComplianceAssessment: protectedProcedure
    .input(z.object({ baselineId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.performComplianceAssessment(
        ctx.user.tenantId,
        input.baselineId
      );
    }),

  // Security Configuration
  setSecurityConfiguration: protectedProcedure
    .input(z.object({
      category: z.string(),
      setting: z.string(),
      value: z.string(),
      description: z.string().optional(),
      riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      compliance: z.array(z.any()).default([])
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedSecurityService.setSecurityConfiguration(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getSecurityConfigurations: protectedProcedure
    .input(z.object({
      category: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      return await advancedSecurityService.getSecurityConfigurations(
        ctx.user.tenantId,
        input.category
      );
    }),

  // Security Dashboard
  getSecurityDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      return await advancedSecurityService.getSecurityDashboard(
        ctx.user.tenantId
      );
    }),

  // Encryption and Security Utilities
  encryptData: protectedProcedure
    .input(z.object({
      data: z.string(),
      key: z.string()
    }))
    .mutation(async ({ input }) => {
      return await advancedSecurityService.encryptData(
        input.data,
        input.key
      );
    }),

  decryptData: protectedProcedure
    .input(z.object({
      encryptedData: z.string(),
      key: z.string()
    }))
    .mutation(async ({ input }) => {
      return await advancedSecurityService.decryptData(
        input.encryptedData,
        input.key
      );
    }),

  hashPassword: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      return await advancedSecurityService.hashPassword(input.password);
    }),

  verifyPassword: protectedProcedure
    .input(z.object({
      password: z.string(),
      hash: z.string()
    }))
    .mutation(async ({ input }) => {
      return await advancedSecurityService.verifyPassword(
        input.password,
        input.hash
      );
    }),

  generateSecureToken: protectedProcedure
    .input(z.object({
      length: z.number().default(32)
    }))
    .mutation(async ({ input }) => {
      return advancedSecurityService.generateSecureToken(input.length);
    }),

  // Rate Limiting
  checkRateLimit: protectedProcedure
    .input(z.object({
      key: z.string(),
      limit: z.number(),
      window: z.number()
    }))
    .query(async ({ input }) => {
      return await advancedSecurityService.checkRateLimit(
        input.key,
        input.limit,
        input.window
      );
    }),

  // Admin Functions
  getSystemSecurityStatus: adminProcedure
    .query(async () => {
      const [
        totalPolicies,
        activeIncidents,
        threatCount
      ] = await Promise.all([
        advancedSecurityService.getPolicies('system', { page: 1, limit: 1 }),
        advancedSecurityService.getIncidents('system', { status: 'investigating', page: 1, limit: 1 }),
        advancedSecurityService.getThreatIntelligence('system', { isActive: true, page: 1, limit: 1 })
      ]);

      return {
        policies: totalPolicies.pagination.total,
        incidents: activeIncidents.pagination.total,
        threats: threatCount.pagination.total,
        timestamp: new Date()
      };
    })
});