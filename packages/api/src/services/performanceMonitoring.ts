import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MetricConfig {
  name: string;
  type: string;
  value: number;
  unit: string;
  tags?: any;
  metadata?: any;
  source: string;
  environment?: string;
}

interface TraceConfig {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: string;
  tags?: any;
  logs?: any[];
  errors?: any[];
  metricId?: string;
}

interface AlertConfig {
  name: string;
  description?: string;
  metricType: string;
  condition: any;
  threshold: number;
  severity: string;
  config?: any;
}

interface HealthCheckConfig {
  service: string;
  endpoint: string;
  status: string;
  responseTime: number;
  statusCode?: number;
  message?: string;
  metadata?: any;
}

interface ProfileConfig {
  name: string;
  type: string;
  data: any;
  duration: number;
  metadata?: any;
}

interface ResourceUsageConfig {
  resourceType: string;
  usage: number;
  limit?: number;
  unit: string;
  metadata?: any;
}

interface BenchmarkConfig {
  name: string;
  type: string;
  config?: any;
  results?: any;
  baseline?: any;
  score?: number;
  passed?: boolean;
}

export class PerformanceMonitoringService {
  async recordMetric(tenantId: string, config: MetricConfig) {
    return await prisma.performanceMetric.create({
      data: {
        ...config,
        tenantId
      }
    });
  }

  async getMetrics(tenantId: string, filters: {
    type?: string;
    name?: string;
    source?: string;
    environment?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.type) where.type = filters.type;
    if (filters.name) where.name = { contains: filters.name };
    if (filters.source) where.source = filters.source;
    if (filters.environment) where.environment = filters.environment;
    if (filters.startTime || filters.endTime) {
      where.timestamp = {};
      if (filters.startTime) where.timestamp.gte = filters.startTime;
      if (filters.endTime) where.timestamp.lte = filters.endTime;
    }

    const [metrics, total] = await Promise.all([
      prisma.performanceMetric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50
      }),
      prisma.performanceMetric.count({ where })
    ]);

    return {
      metrics,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        pages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async getMetricAggregations(tenantId: string, filters: {
    type?: string;
    name?: string;
    groupBy: 'hour' | 'day' | 'week' | 'month';
    startTime: Date;
    endTime: Date;
  }) {
    const timeFormat = {
      hour: '%Y-%m-%d %H:00:00',
      day: '%Y-%m-%d',
      week: '%Y-%u',
      month: '%Y-%m'
    }[filters.groupBy];

    const groupByClause = `DATE_FORMAT(timestamp, '${timeFormat}')`;
    
    const where: any = { 
      tenantId,
      timestamp: {
        gte: filters.startTime,
        lte: filters.endTime
      }
    };
    
    if (filters.type) where.type = filters.type;
    if (filters.name) where.name = { contains: filters.name };

    return await prisma.$queryRaw`
      SELECT 
        ${groupByClause} as period,
        type,
        COUNT(*) as count,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        SUM(value) as sum_value
      FROM performance_metrics 
      WHERE tenant_id = ${tenantId}
        AND timestamp >= ${filters.startTime}
        AND timestamp <= ${filters.endTime}
        ${filters.type ? `AND type = '${filters.type}'` : ''}
        ${filters.name ? `AND name LIKE '%${filters.name}%'` : ''}
      GROUP BY period, type
      ORDER BY period DESC
    `;
  }

  async createTrace(tenantId: string, config: TraceConfig) {
    return await prisma.performanceTrace.create({
      data: {
        ...config,
        tenantId
      }
    });
  }

  async getTraces(tenantId: string, filters: {
    traceId?: string;
    operationName?: string;
    status?: string;
    startTime?: Date;
    endTime?: Date;
    minDuration?: number;
    maxDuration?: number;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.traceId) where.traceId = filters.traceId;
    if (filters.operationName) where.operationName = { contains: filters.operationName };
    if (filters.status) where.status = filters.status;
    if (filters.startTime || filters.endTime) {
      where.startTime = {};
      if (filters.startTime) where.startTime.gte = filters.startTime;
      if (filters.endTime) where.startTime.lte = filters.endTime;
    }
    if (filters.minDuration) where.duration = { gte: filters.minDuration };
    if (filters.maxDuration) where.duration = { ...where.duration, lte: filters.maxDuration };

    const [traces, total] = await Promise.all([
      prisma.performanceTrace.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50
      }),
      prisma.performanceTrace.count({ where })
    ]);

    return {
      traces,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        pages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async getTracesByOperationStats(tenantId: string, timeRange: { start: Date; end: Date }) {
    return await prisma.$queryRaw`
      SELECT 
        operation_name,
        COUNT(*) as call_count,
        AVG(duration) as avg_duration,
        MIN(duration) as min_duration,
        MAX(duration) as max_duration,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_count,
        (SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate
      FROM performance_traces 
      WHERE tenant_id = ${tenantId}
        AND start_time >= ${timeRange.start}
        AND start_time <= ${timeRange.end}
      GROUP BY operation_name
      ORDER BY call_count DESC
    `;
  }

  async createAlert(tenantId: string, userId: string, config: AlertConfig) {
    return await prisma.performanceAlert.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getAlerts(tenantId: string, filters: {
    isActive?: boolean;
    severity?: string;
    metricType?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.severity) where.severity = filters.severity;
    if (filters.metricType) where.metricType = filters.metricType;

    const [alerts, total] = await Promise.all([
      prisma.performanceAlert.findMany({
        where,
        include: {
          triggers: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.performanceAlert.count({ where })
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

  async evaluateAlert(tenantId: string, alertId: string) {
    const alert = await prisma.performanceAlert.findFirst({
      where: { id: alertId, tenantId }
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    const recentMetrics = await prisma.performanceMetric.findMany({
      where: {
        tenantId,
        type: alert.metricType,
        timestamp: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (recentMetrics.length === 0) {
      return { triggered: false, message: 'No recent metrics found' };
    }

    const latestValue = recentMetrics[0].value;
    const condition = alert.condition as any;
    let triggered = false;
    let message = '';

    switch (condition.operator) {
      case 'gt':
        triggered = latestValue > alert.threshold;
        message = `${alert.name}: Value ${latestValue} is greater than threshold ${alert.threshold}`;
        break;
      case 'lt':
        triggered = latestValue < alert.threshold;
        message = `${alert.name}: Value ${latestValue} is less than threshold ${alert.threshold}`;
        break;
      case 'eq':
        triggered = latestValue === alert.threshold;
        message = `${alert.name}: Value ${latestValue} equals threshold ${alert.threshold}`;
        break;
      default:
        triggered = false;
        message = 'Unknown condition operator';
    }

    if (triggered) {
      await prisma.performanceAlertTrigger.create({
        data: {
          tenantId,
          alertId,
          metricValue: latestValue,
          threshold: alert.threshold,
          severity: alert.severity as any,
          message,
          metadata: { condition, metrics: recentMetrics.slice(0, 3) }
        }
      });

      await prisma.performanceAlert.update({
        where: { id: alertId },
        data: { lastTriggered: new Date() }
      });
    }

    return { triggered, message, value: latestValue, threshold: alert.threshold };
  }

  async recordHealthCheck(tenantId: string, config: HealthCheckConfig) {
    return await prisma.systemHealthCheck.create({
      data: {
        ...config,
        tenantId
      }
    });
  }

  async getHealthChecks(tenantId: string, filters: {
    service?: string;
    status?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.service) where.service = filters.service;
    if (filters.status) where.status = filters.status;
    if (filters.startTime || filters.endTime) {
      where.checkedAt = {};
      if (filters.startTime) where.checkedAt.gte = filters.startTime;
      if (filters.endTime) where.checkedAt.lte = filters.endTime;
    }

    const [checks, total] = await Promise.all([
      prisma.systemHealthCheck.findMany({
        where,
        orderBy: { checkedAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50
      }),
      prisma.systemHealthCheck.count({ where })
    ]);

    return {
      checks,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        pages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async getSystemOverview(tenantId: string) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      recentMetrics,
      activeAlerts,
      healthStatus,
      errorRate,
      avgResponseTime
    ] = await Promise.all([
      prisma.performanceMetric.count({
        where: {
          tenantId,
          timestamp: { gte: oneHourAgo }
        }
      }),
      prisma.performanceAlert.count({
        where: {
          tenantId,
          isActive: true,
          lastTriggered: { gte: twentyFourHoursAgo }
        }
      }),
      prisma.systemHealthCheck.findMany({
        where: {
          tenantId,
          checkedAt: { gte: oneHourAgo }
        },
        distinct: ['service'],
        orderBy: { checkedAt: 'desc' }
      }),
      prisma.performanceTrace.aggregate({
        where: {
          tenantId,
          startTime: { gte: oneHourAgo },
          status: 'error'
        },
        _count: true
      }),
      prisma.performanceTrace.aggregate({
        where: {
          tenantId,
          startTime: { gte: oneHourAgo }
        },
        _avg: { duration: true },
        _count: true
      })
    ]);

    const totalTraces = avgResponseTime._count;
    const errorCount = errorRate._count;

    return {
      recentMetrics,
      activeAlerts,
      healthServices: healthStatus.map(h => ({
        service: h.service,
        status: h.status,
        responseTime: h.responseTime,
        lastChecked: h.checkedAt
      })),
      errorRate: totalTraces > 0 ? (errorCount / totalTraces * 100).toFixed(2) : '0.00',
      avgResponseTime: avgResponseTime._avg.duration || 0,
      totalRequests: totalTraces
    };
  }

  async createProfile(tenantId: string, userId: string, config: ProfileConfig) {
    return await prisma.performanceProfile.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getProfiles(tenantId: string, filters: {
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.type) where.type = filters.type;

    const [profiles, total] = await Promise.all([
      prisma.performanceProfile.findMany({
        where,
        include: { creator: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.performanceProfile.count({ where })
    ]);

    return {
      profiles,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async recordResourceUsage(tenantId: string, config: ResourceUsageConfig) {
    return await prisma.resourceUsage.create({
      data: {
        ...config,
        tenantId
      }
    });
  }

  async getResourceUsage(tenantId: string, filters: {
    resourceType?: string;
    startTime?: Date;
    endTime?: Date;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.resourceType) where.resourceType = filters.resourceType;
    if (filters.startTime || filters.endTime) {
      where.timestamp = {};
      if (filters.startTime) where.timestamp.gte = filters.startTime;
      if (filters.endTime) where.timestamp.lte = filters.endTime;
    }

    const [usage, total] = await Promise.all([
      prisma.resourceUsage.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 50),
        take: filters.limit || 50
      }),
      prisma.resourceUsage.count({ where })
    ]);

    return {
      usage,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total,
        pages: Math.ceil(total / (filters.limit || 50))
      }
    };
  }

  async createBenchmark(tenantId: string, userId: string, config: BenchmarkConfig) {
    return await prisma.performanceBenchmark.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async runBenchmark(tenantId: string, benchmarkId: string) {
    const benchmark = await prisma.performanceBenchmark.findFirst({
      where: { id: benchmarkId, tenantId }
    });

    if (!benchmark) {
      throw new Error('Benchmark not found');
    }

    const config = benchmark.config as any;
    const results: any = {};

    switch (benchmark.type) {
      case 'load_test':
        results.throughput = await this.simulateLoadTest(config);
        break;
      case 'stress_test':
        results.breakdown_point = await this.simulateStressTest(config);
        break;
      case 'performance_regression':
        results.comparison = await this.compareWithBaseline(tenantId, config);
        break;
      default:
        results.message = 'Benchmark type not implemented';
    }

    const score = this.calculateBenchmarkScore(benchmark.type, results, benchmark.baseline);
    const passed = score >= (config.passingScore || 80);

    await prisma.performanceBenchmark.update({
      where: { id: benchmarkId },
      data: {
        results,
        score,
        passed
      }
    });

    return { benchmark, results, score, passed };
  }

  private async simulateLoadTest(config: any) {
    const duration = config.duration || 60; // seconds
    const rps = config.requestsPerSecond || 100;
    
    return {
      duration,
      requestsPerSecond: rps,
      totalRequests: duration * rps,
      avgResponseTime: Math.random() * 100 + 50, // 50-150ms
      maxResponseTime: Math.random() * 500 + 200, // 200-700ms
      errorRate: Math.random() * 5 // 0-5%
    };
  }

  private async simulateStressTest(config: any) {
    const maxRps = config.maxRequestsPerSecond || 1000;
    
    return {
      maxSustainableRps: Math.floor(maxRps * (0.7 + Math.random() * 0.2)),
      breakdownPoint: Math.floor(maxRps * (0.8 + Math.random() * 0.2)),
      recoveryTime: Math.random() * 30 + 10 // 10-40 seconds
    };
  }

  private async compareWithBaseline(tenantId: string, config: any) {
    const baseline = config.baseline || {};
    const current = await this.getMetricAggregations(tenantId, {
      groupBy: 'hour',
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date()
    });

    return {
      baseline,
      current,
      improvement: Math.random() * 20 - 10 // -10% to +10%
    };
  }

  private calculateBenchmarkScore(type: string, results: any, baseline: any): number {
    switch (type) {
      case 'load_test':
        const responseTimeScore = Math.max(0, 100 - (results.avgResponseTime - 50) * 2);
        const errorRateScore = Math.max(0, 100 - results.errorRate * 20);
        return (responseTimeScore + errorRateScore) / 2;
      
      case 'stress_test':
        return Math.min(100, (results.maxSustainableRps / 100) * 10);
      
      case 'performance_regression':
        return Math.max(0, Math.min(100, 50 + results.improvement * 5));
      
      default:
        return 0;
    }
  }

  async getBenchmarks(tenantId: string, filters: {
    type?: string;
    passed?: boolean;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    
    if (filters.type) where.type = filters.type;
    if (filters.passed !== undefined) where.passed = filters.passed;

    const [benchmarks, total] = await Promise.all([
      prisma.performanceBenchmark.findMany({
        where,
        include: { creator: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20
      }),
      prisma.performanceBenchmark.count({ where })
    ]);

    return {
      benchmarks,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20))
      }
    };
  }

  async generatePerformanceReport(tenantId: string, timeRange: { start: Date; end: Date }) {
    const [
      metricsSummary,
      tracesSummary,
      alertsSummary,
      healthSummary,
      resourceSummary
    ] = await Promise.all([
      this.getMetricAggregations(tenantId, {
        groupBy: 'day',
        startTime: timeRange.start,
        endTime: timeRange.end
      }),
      this.getTracesByOperationStats(tenantId, timeRange),
      prisma.performanceAlertTrigger.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        include: { alert: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.systemHealthCheck.findMany({
        where: {
          tenantId,
          checkedAt: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        distinct: ['service'],
        orderBy: { checkedAt: 'desc' }
      }),
      prisma.resourceUsage.findMany({
        where: {
          tenantId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end
          }
        },
        orderBy: { timestamp: 'desc' }
      })
    ]);

    return {
      timeRange,
      summary: {
        totalMetrics: metricsSummary.length,
        totalTraces: tracesSummary.length,
        totalAlerts: alertsSummary.length,
        healthChecks: healthSummary.length,
        resourceReadings: resourceSummary.length
      },
      metrics: metricsSummary,
      traces: tracesSummary,
      alerts: alertsSummary,
      health: healthSummary,
      resources: resourceSummary,
      recommendations: this.generateRecommendations(metricsSummary, tracesSummary, alertsSummary)
    };
  }

  private generateRecommendations(metrics: any[], traces: any[], alerts: any[]): string[] {
    const recommendations: string[] = [];

    if (alerts.length > 10) {
      recommendations.push('Consider reviewing alert thresholds - high number of triggered alerts detected');
    }

    const errorTraces = traces.filter((t: any) => t.error_rate > 5);
    if (errorTraces.length > 0) {
      recommendations.push(`High error rates detected in ${errorTraces.length} operations - investigate root causes`);
    }

    const slowTraces = traces.filter((t: any) => t.avg_duration > 1000);
    if (slowTraces.length > 0) {
      recommendations.push(`Slow operations detected (>1s average) - optimize ${slowTraces.length} operations`);
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is within normal parameters');
    }

    return recommendations;
  }

  async cleanupOldData(retentionDays: number = 30) {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const [
      deletedMetrics,
      deletedTraces,
      deletedHealthChecks,
      deletedResourceUsage
    ] = await Promise.all([
      prisma.performanceMetric.deleteMany({
        where: { timestamp: { lt: cutoffDate } }
      }),
      prisma.performanceTrace.deleteMany({
        where: { startTime: { lt: cutoffDate } }
      }),
      prisma.systemHealthCheck.deleteMany({
        where: { checkedAt: { lt: cutoffDate } }
      }),
      prisma.resourceUsage.deleteMany({
        where: { timestamp: { lt: cutoffDate } }
      })
    ]);

    return {
      deletedMetrics: deletedMetrics.count,
      deletedTraces: deletedTraces.count,
      deletedHealthChecks: deletedHealthChecks.count,
      deletedResourceUsage: deletedResourceUsage.count,
      cutoffDate
    };
  }
}