import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface PolicyConfig {
  name: string;
  description?: string;
  policyType: string;
  rules: any[];
  severity: string;
  actions?: any[];
  exemptions?: any[];
  metadata?: any;
}

interface ViolationConfig {
  policyId: string;
  userId?: string;
  violationType: string;
  severity: string;
  description: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  actions?: any[];
}

interface ScanConfig {
  scanType: string;
  target: string;
  config?: any;
  scheduledBy?: string;
}

interface IncidentConfig {
  title: string;
  description: string;
  incidentType: string;
  severity: string;
  affectedUsers?: string[];
  affectedSystems?: string[];
}

interface AlertConfig {
  alertType: string;
  title: string;
  message: string;
  severity: string;
  source: string;
  metadata?: any;
}

interface ThreatConfig {
  threatType: string;
  source: string;
  confidence: number;
  severity: string;
  description: string;
  indicators?: any[];
  references?: string[];
  tags?: string[];
}

export class AdvancedSecurityService {
  // Policy Management
  async createPolicy(tenantId: string, userId: string, config: PolicyConfig) {
    return await prisma.securityPolicy.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId,
        rules: config.rules || [],
        actions: config.actions || [],
        exemptions: config.exemptions || [],
        metadata: config.metadata || {}
      }
    });
  }

  async getPolicies(tenantId: string, filters: {
    policyType?: string;
    isActive?: boolean;
    severity?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.policyType) where.policyType = filters.policyType;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.severity) where.severity = filters.severity;

    const [policies, total] = await Promise.all([
      prisma.securityPolicy.findMany({
        where,
        include: {
          _count: { select: { violations: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.securityPolicy.count({ where })
    ]);

    return {
      policies,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async evaluatePolicy(tenantId: string, policyId: string, context: any) {
    const policy = await prisma.securityPolicy.findFirst({
      where: { id: policyId, tenantId, isActive: true }
    });

    if (!policy) {
      throw new Error('Policy not found or inactive');
    }

    const violations: any[] = [];
    const rules = policy.rules as any[];

    for (const rule of rules) {
      if (!this.evaluateRule(rule, context)) {
        violations.push({
          rule,
          context,
          timestamp: new Date()
        });
      }
    }

    if (violations.length > 0) {
      await this.recordViolation(tenantId, {
        policyId,
        userId: context.userId,
        violationType: 'policy_violation',
        severity: policy.severity as any,
        description: `Policy "${policy.name}" violated`,
        details: { violations },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        endpoint: context.endpoint
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      policy
    };
  }

  private evaluateRule(rule: any, context: any): boolean {
    const { type, condition, value } = rule;

    switch (type) {
      case 'ip_whitelist':
        return value.includes(context.ipAddress);
      case 'ip_blacklist':
        return !value.includes(context.ipAddress);
      case 'time_window':
        const now = new Date().getHours();
        return now >= value.start && now <= value.end;
      case 'rate_limit':
        return context.requestCount <= value.maxRequests;
      case 'geo_restriction':
        return value.allowedCountries.includes(context.country);
      case 'user_role':
        return value.allowedRoles.includes(context.userRole);
      default:
        return true;
    }
  }

  // Violation Management
  async recordViolation(tenantId: string, config: ViolationConfig) {
    const violation = await prisma.securityViolation.create({
      data: {
        ...config,
        tenantId,
        details: config.details || {},
        actions: config.actions || []
      },
      include: {
        policy: true,
        user: true
      }
    });

    // Execute automated actions
    if (violation.policy.actions) {
      await this.executeSecurityActions(violation.policy.actions as any[], violation);
    }

    // Create alert for high/critical violations
    if (violation.severity === 'high' || violation.severity === 'critical') {
      await this.createAlert(tenantId, {
        alertType: 'policy_violation',
        title: `${violation.severity.toUpperCase()} Security Violation`,
        message: violation.description,
        severity: violation.severity as any,
        source: 'security_policy',
        metadata: { violationId: violation.id }
      });
    }

    return violation;
  }

  private async executeSecurityActions(actions: any[], violation: any) {
    for (const action of actions) {
      switch (action.type) {
        case 'block_ip':
          await this.blockIP(violation.ipAddress, action.duration);
          break;
        case 'lock_account':
          if (violation.userId) {
            await this.lockUserAccount(violation.userId, action.duration);
          }
          break;
        case 'notify_admin':
          await this.notifyAdmins(violation);
          break;
        case 'log_event':
          await this.logSecurityEvent(violation);
          break;
      }
    }
  }

  private async blockIP(ipAddress: string, duration: number) {
    // Implement IP blocking logic
    console.log(`Blocking IP ${ipAddress} for ${duration} seconds`);
  }

  private async lockUserAccount(userId: string, duration: number) {
    // Implement account locking logic
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' }
    });
  }

  private async notifyAdmins(violation: any) {
    // Implement admin notification logic
    console.log('Notifying admins of security violation:', violation.id);
  }

  private async logSecurityEvent(violation: any) {
    // Additional security event logging
    console.log('Security event logged:', violation);
  }

  async getViolations(tenantId: string, filters: {
    severity?: string;
    resolved?: boolean;
    userId?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.severity) where.severity = filters.severity;
    if (filters.resolved !== undefined) where.resolved = filters.resolved;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startTime || filters.endTime) {
      where.createdAt = {};
      if (filters.startTime) where.createdAt.gte = filters.startTime;
      if (filters.endTime) where.createdAt.lte = filters.endTime;
    }

    const [violations, total] = await Promise.all([
      prisma.securityViolation.findMany({
        where,
        include: {
          policy: true,
          user: { select: { name: true, email: true } },
          resolver: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.securityViolation.count({ where })
    ]);

    return {
      violations,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  // Security Scanning
  async createScan(tenantId: string, config: ScanConfig) {
    const scan = await prisma.securityScan.create({
      data: {
        ...config,
        tenantId,
        status: 'running',
        config: config.config || {}
      }
    });

    // Execute scan asynchronously
    this.executeScan(scan.id, scan.scanType, scan.target, scan.config);

    return scan;
  }

  private async executeScan(scanId: string, scanType: string, target: string, config: any) {
    const findings: any[] = [];
    const startTime = Date.now();

    try {
      switch (scanType) {
        case 'vulnerability_scan':
          findings.push(...await this.performVulnerabilityScan(target, config));
          break;
        case 'penetration_test':
          findings.push(...await this.performPenetrationTest(target, config));
          break;
        case 'compliance_audit':
          findings.push(...await this.performComplianceAudit(target, config));
          break;
        case 'code_analysis':
          findings.push(...await this.performCodeAnalysis(target, config));
          break;
        case 'dependency_check':
          findings.push(...await this.performDependencyCheck(target, config));
          break;
      }

      const summary = this.generateScanSummary(findings);

      await prisma.securityScan.update({
        where: { id: scanId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          duration: Date.now() - startTime,
          findings,
          summary
        }
      });
    } catch (error: any) {
      await prisma.securityScan.update({
        where: { id: scanId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          duration: Date.now() - startTime,
          summary: { error: error.message }
        }
      });
    }
  }

  private async performVulnerabilityScan(target: string, config: any): Promise<any[]> {
    // Mock vulnerability scanning
    return [
      {
        type: 'vulnerability',
        severity: 'medium',
        title: 'Outdated dependency detected',
        description: 'Package X is outdated and has known vulnerabilities',
        cve: 'CVE-2024-1234',
        remediation: 'Update to version 2.0.0 or higher'
      }
    ];
  }

  private async performPenetrationTest(target: string, config: any): Promise<any[]> {
    // Mock penetration testing
    return [
      {
        type: 'penetration',
        severity: 'high',
        title: 'SQL Injection vulnerability',
        description: 'Input validation missing on user input field',
        location: '/api/users',
        remediation: 'Implement proper input validation and parameterized queries'
      }
    ];
  }

  private async performComplianceAudit(target: string, config: any): Promise<any[]> {
    // Mock compliance audit
    return [
      {
        type: 'compliance',
        severity: 'low',
        title: 'Missing privacy policy update',
        description: 'Privacy policy needs update for GDPR compliance',
        standard: 'GDPR',
        remediation: 'Update privacy policy with required GDPR clauses'
      }
    ];
  }

  private async performCodeAnalysis(target: string, config: any): Promise<any[]> {
    // Mock code analysis
    return [
      {
        type: 'code_quality',
        severity: 'low',
        title: 'Hardcoded credentials detected',
        description: 'API key found in source code',
        file: 'src/config.js',
        line: 42,
        remediation: 'Move credentials to environment variables'
      }
    ];
  }

  private async performDependencyCheck(target: string, config: any): Promise<any[]> {
    // Mock dependency checking
    return [
      {
        type: 'dependency',
        severity: 'medium',
        title: 'Vulnerable dependency',
        package: 'lodash',
        version: '4.17.11',
        vulnerability: 'Prototype pollution',
        remediation: 'Update to version 4.17.21 or higher'
      }
    ];
  }

  private generateScanSummary(findings: any[]): any {
    const summary = {
      total: findings.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      byType: {} as any
    };

    for (const finding of findings) {
      summary.bySeverity[finding.severity as keyof typeof summary.bySeverity]++;
      summary.byType[finding.type] = (summary.byType[finding.type] || 0) + 1;
    }

    return summary;
  }

  // Incident Management
  async createIncident(tenantId: string, reporterId: string, config: IncidentConfig) {
    const incident = await prisma.securityIncident.create({
      data: {
        ...config,
        tenantId,
        reportedBy: reporterId,
        status: 'reported',
        affectedUsers: config.affectedUsers || [],
        affectedSystems: config.affectedSystems || [],
        timeline: [{
          timestamp: new Date(),
          action: 'Incident reported',
          actor: reporterId
        }],
        evidence: []
      },
      include: {
        reporter: { select: { name: true, email: true } }
      }
    });

    // Create alert for high/critical incidents
    if (incident.severity === 'high' || incident.severity === 'critical') {
      await this.createAlert(tenantId, {
        alertType: 'incident',
        title: `${incident.severity.toUpperCase()} Security Incident`,
        message: incident.title,
        severity: incident.severity as any,
        source: 'incident_management',
        metadata: { incidentId: incident.id }
      });
    }

    return incident;
  }

  async updateIncident(tenantId: string, incidentId: string, updates: any, userId: string) {
    const incident = await prisma.securityIncident.findFirst({
      where: { id: incidentId, tenantId }
    });

    if (!incident) {
      throw new Error('Incident not found');
    }

    const timeline = incident.timeline as any[];
    timeline.push({
      timestamp: new Date(),
      action: `Status changed to ${updates.status || incident.status}`,
      actor: userId,
      details: updates
    });

    return await prisma.securityIncident.update({
      where: { id: incidentId },
      data: {
        ...updates,
        timeline,
        resolvedAt: updates.status === 'closed' ? new Date() : undefined
      },
      include: {
        assignee: { select: { name: true, email: true } },
        reporter: { select: { name: true, email: true } }
      }
    });
  }

  async getIncidents(tenantId: string, filters: {
    status?: string;
    severity?: string;
    incidentType?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.incidentType) where.incidentType = filters.incidentType;
    if (filters.assignedTo) where.assignedTo = filters.assignedTo;

    const [incidents, total] = await Promise.all([
      prisma.securityIncident.findMany({
        where,
        include: {
          assignee: { select: { name: true, email: true } },
          reporter: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.securityIncident.count({ where })
    ]);

    return {
      incidents,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  // Alert Management
  async createAlert(tenantId: string, config: AlertConfig) {
    return await prisma.securityAlert.create({
      data: {
        ...config,
        tenantId,
        metadata: config.metadata || {}
      }
    });
  }

  async acknowledgeAlert(tenantId: string, alertId: string, userId: string) {
    return await prisma.securityAlert.update({
      where: { id: alertId, tenantId },
      data: {
        acknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date()
      }
    });
  }

  async resolveAlert(tenantId: string, alertId: string, userId: string) {
    return await prisma.securityAlert.update({
      where: { id: alertId, tenantId },
      data: {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date()
      }
    });
  }

  async getAlerts(tenantId: string, filters: {
    severity?: string;
    alertType?: string;
    acknowledged?: boolean;
    resolved?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.severity) where.severity = filters.severity;
    if (filters.alertType) where.alertType = filters.alertType;
    if (filters.acknowledged !== undefined) where.acknowledged = filters.acknowledged;
    if (filters.resolved !== undefined) where.resolved = filters.resolved;

    const [alerts, total] = await Promise.all([
      prisma.securityAlert.findMany({
        where,
        include: {
          acknowledger: { select: { name: true, email: true } },
          resolver: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.securityAlert.count({ where })
    ]);

    return {
      alerts,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  // Audit Logging
  async logAuditEvent(tenantId: string, event: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    outcome: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
  }) {
    const riskScore = this.calculateRiskScore(event);

    const auditLog = await prisma.securityAuditLog.create({
      data: {
        ...event,
        tenantId,
        outcome: event.outcome as any,
        details: event.details || {},
        riskScore,
        metadata: {}
      }
    });

    // Alert on high-risk events
    if (riskScore > 0.7) {
      await this.createAlert(tenantId, {
        alertType: 'anomaly_detection',
        title: 'High-risk activity detected',
        message: `${event.action} on ${event.resource}`,
        severity: 'high',
        source: 'audit_log',
        metadata: { auditLogId: auditLog.id, riskScore }
      });
    }

    return auditLog;
  }

  private calculateRiskScore(event: any): number {
    let score = 0;

    // Failed authentication attempts
    if (event.action === 'login' && event.outcome === 'failure') score += 0.3;
    
    // Privilege escalation attempts
    if (event.action.includes('role') || event.action.includes('permission')) score += 0.4;
    
    // Data access patterns
    if (event.action.includes('export') || event.action.includes('download')) score += 0.2;
    
    // Unusual time of access
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 0.1;
    
    // Multiple failed attempts
    if (event.details?.attemptCount > 3) score += 0.3;

    return Math.min(score, 1.0);
  }

  async getAuditLogs(tenantId: string, filters: {
    userId?: string;
    action?: string;
    resource?: string;
    outcome?: string;
    minRiskScore?: number;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = { contains: filters.action };
    if (filters.resource) where.resource = { contains: filters.resource };
    if (filters.outcome) where.outcome = filters.outcome;
    if (filters.minRiskScore) where.riskScore = { gte: filters.minRiskScore };
    if (filters.startTime || filters.endTime) {
      where.timestamp = {};
      if (filters.startTime) where.timestamp.gte = filters.startTime;
      if (filters.endTime) where.timestamp.lte = filters.endTime;
    }

    const [logs, total] = await Promise.all([
      prisma.securityAuditLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { timestamp: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50
      }),
      prisma.securityAuditLog.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        pages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  // Threat Intelligence
  async addThreatIntelligence(tenantId: string, config: ThreatConfig) {
    return await prisma.threatIntelligence.create({
      data: {
        ...config,
        tenantId,
        indicators: config.indicators || [],
        references: config.references || [],
        tags: config.tags || [],
        metadata: {}
      }
    });
  }

  async getThreatIntelligence(tenantId: string, filters: {
    threatType?: string;
    severity?: string;
    isActive?: boolean;
    minConfidence?: number;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.threatType) where.threatType = filters.threatType;
    if (filters.severity) where.severity = filters.severity;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.minConfidence) where.confidence = { gte: filters.minConfidence };

    const [threats, total] = await Promise.all([
      prisma.threatIntelligence.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.threatIntelligence.count({ where })
    ]);

    return {
      threats,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async checkThreatIndicator(tenantId: string, indicator: string): Promise<any[]> {
    const threats = await prisma.threatIntelligence.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { source: indicator },
          { indicators: { array_contains: indicator } }
        ]
      }
    });

    return threats;
  }

  // Security Baseline and Compliance
  async createBaseline(tenantId: string, userId: string, config: {
    name: string;
    description?: string;
    framework: string;
    version: string;
    controls: any[];
  }) {
    const compliance = await this.assessCompliance(config.controls);

    return await prisma.securityBaseline.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId,
        compliance,
        controls: config.controls || [],
        findings: [],
        remediation: []
      }
    });
  }

  private async assessCompliance(controls: any[]): Promise<number> {
    const totalControls = controls.length;
    const implementedControls = controls.filter(c => c.status === 'implemented').length;
    
    return totalControls > 0 ? (implementedControls / totalControls) * 100 : 0;
  }

  async performComplianceAssessment(tenantId: string, baselineId: string) {
    const baseline = await prisma.securityBaseline.findFirst({
      where: { id: baselineId, tenantId }
    });

    if (!baseline) {
      throw new Error('Baseline not found');
    }

    const controls = baseline.controls as any[];
    const findings: any[] = [];
    const remediation: any[] = [];

    for (const control of controls) {
      const assessment = await this.assessControl(control);
      
      if (!assessment.compliant) {
        findings.push({
          controlId: control.id,
          title: control.title,
          severity: assessment.severity,
          description: assessment.description,
          evidence: assessment.evidence
        });

        remediation.push({
          controlId: control.id,
          action: assessment.remediation,
          priority: assessment.priority,
          estimatedEffort: assessment.effort
        });
      }
    }

    const compliance = await this.assessCompliance(controls);

    return await prisma.securityBaseline.update({
      where: { id: baselineId },
      data: {
        compliance,
        findings,
        remediation,
        lastAssessed: new Date(),
        nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      }
    });
  }

  private async assessControl(control: any): Promise<any> {
    // Mock control assessment
    const compliant = Math.random() > 0.3;
    
    return {
      compliant,
      severity: compliant ? 'low' : 'medium',
      description: compliant ? 'Control is properly implemented' : 'Control needs improvement',
      evidence: [],
      remediation: 'Implement additional security measures',
      priority: 'medium',
      effort: '2-3 days'
    };
  }

  // Security Configuration
  async setSecurityConfiguration(tenantId: string, userId: string, config: {
    category: string;
    setting: string;
    value: string;
    description?: string;
    riskLevel?: string;
    compliance?: any[];
  }) {
    return await prisma.securityConfiguration.upsert({
      where: {
        tenantId_category_setting: {
          tenantId,
          category: config.category,
          setting: config.setting
        }
      },
      update: {
        value: config.value,
        riskLevel: config.riskLevel as any,
        description: config.description,
        compliance: config.compliance || [],
        lastModified: new Date(),
        modifiedBy: userId
      },
      create: {
        ...config,
        tenantId,
        modifiedBy: userId,
        compliance: config.compliance || []
      }
    });
  }

  async getSecurityConfigurations(tenantId: string, category?: string) {
    const where: any = { tenantId };
    if (category) where.category = category;

    return await prisma.securityConfiguration.findMany({
      where,
      include: {
        modifier: { select: { name: true, email: true } }
      },
      orderBy: { category: 'asc' }
    });
  }

  // Security Dashboard
  async getSecurityDashboard(tenantId: string) {
    const [
      activeViolations,
      openIncidents,
      unresolvedAlerts,
      recentScans,
      complianceScore,
      threatLevel
    ] = await Promise.all([
      prisma.securityViolation.count({
        where: { tenantId, resolved: false }
      }),
      prisma.securityIncident.count({
        where: {
          tenantId,
          status: { not: 'closed' }
        }
      }),
      prisma.securityAlert.count({
        where: { tenantId, resolved: false }
      }),
      prisma.securityScan.findMany({
        where: { tenantId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          scanType: true,
          status: true,
          summary: true,
          startedAt: true
        }
      }),
      this.getComplianceScore(tenantId),
      this.getThreatLevel(tenantId)
    ]);

    return {
      metrics: {
        activeViolations,
        openIncidents,
        unresolvedAlerts,
        complianceScore,
        threatLevel
      },
      recentScans,
      timestamp: new Date()
    };
  }

  private async getComplianceScore(tenantId: string): Promise<number> {
    const baselines = await prisma.securityBaseline.findMany({
      where: { tenantId, isActive: true },
      select: { compliance: true }
    });

    if (baselines.length === 0) return 0;

    const totalCompliance = baselines.reduce((sum, b) => sum + b.compliance, 0);
    return totalCompliance / baselines.length;
  }

  private async getThreatLevel(tenantId: string): Promise<string> {
    const recentThreats = await prisma.threatIntelligence.count({
      where: {
        tenantId,
        isActive: true,
        severity: { in: ['high', 'critical'] },
        lastSeen: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    if (recentThreats > 10) return 'critical';
    if (recentThreats > 5) return 'high';
    if (recentThreats > 2) return 'medium';
    return 'low';
  }

  // Encryption and Hashing
  async encryptData(data: string, key: string): Promise<string> {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async decryptData(encryptedData: string, key: string): Promise<string> {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Rate Limiting
  private rateLimitStore = new Map<string, { count: number; resetAt: number }>();

  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const now = Date.now();
    const entry = this.rateLimitStore.get(key);

    if (!entry || entry.resetAt < now) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetAt: now + window
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }
}