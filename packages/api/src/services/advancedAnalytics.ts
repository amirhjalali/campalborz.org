import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface DashboardConfig {
  name: string;
  description?: string;
  layout: Record<string, any>;
  config?: Record<string, any>;
  isPublic?: boolean;
  tags?: string[];
}

export interface WidgetConfig {
  name: string;
  type: 'LINE_CHART' | 'BAR_CHART' | 'PIE_CHART' | 'DONUT_CHART' | 'AREA_CHART' | 'SCATTER_PLOT' | 'HEATMAP' | 'TABLE' | 'METRIC' | 'GAUGE' | 'FUNNEL' | 'COHORT' | 'MAP' | 'TREEMAP' | 'SANKEY' | 'WATERFALL';
  config: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  dataSource: Record<string, any>;
  refreshRate?: number;
}

export interface MetricConfig {
  name: string;
  displayName: string;
  description?: string;
  category: string;
  type: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'DISTINCT_COUNT' | 'RATIO' | 'PERCENTAGE' | 'GROWTH_RATE' | 'CUSTOM';
  formula: string;
  unit?: string;
  format?: string;
  tags?: string[];
}

export interface QueryConfig {
  name: string;
  description?: string;
  query: string;
  type: 'SQL' | 'AGGREGATION' | 'TIME_SERIES' | 'COHORT' | 'FUNNEL' | 'RETENTION' | 'SEGMENT';
  parameters?: Record<string, any>;
  schedule?: string;
}

export interface AlertConfig {
  name: string;
  description?: string;
  metricId?: string;
  condition: Record<string, any>;
  threshold?: number;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  channels?: string[];
}

export interface CohortConfig {
  name: string;
  description?: string;
  cohortType: 'ACQUISITION' | 'BEHAVIORAL' | 'REVENUE';
  dateColumn: string;
  valueColumn?: string;
  groupBy?: string[];
  filters?: Record<string, any>;
  periods?: number;
  periodType?: 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}

export interface FunnelConfig {
  name: string;
  description?: string;
  steps: Array<{
    name: string;
    event: string;
    filters?: Record<string, any>;
  }>;
  timeWindow?: number;
  filters?: Record<string, any>;
}

export interface RetentionConfig {
  name: string;
  description?: string;
  entityType: string;
  startEvent: Record<string, any>;
  returnEvent: Record<string, any>;
  timeWindows?: number[];
  filters?: Record<string, any>;
}

export interface SegmentConfig {
  name: string;
  description?: string;
  entityType: string;
  criteria: Record<string, any>;
  metrics?: string[];
}

export class AdvancedAnalyticsService {

  // Dashboard Management
  async createDashboard(tenantId: string, userId: string, config: DashboardConfig) {
    return await prisma.analyticsDashboard.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getDashboards(tenantId: string, userId?: string) {
    const where: any = { tenantId, isActive: true };
    
    // If userId provided, include private dashboards for that user
    if (userId) {
      where.OR = [
        { isPublic: true },
        { createdBy: userId },
        {
          shares: {
            some: {
              sharedWith: userId,
              isActive: true
            }
          }
        }
      ];
    } else {
      where.isPublic = true;
    }

    return await prisma.analyticsDashboard.findMany({
      where,
      include: {
        creator: true,
        widgets: {
          where: { isActive: true },
          orderBy: [
            { position: 'asc' }
          ]
        },
        _count: {
          select: {
            widgets: true,
            shares: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getDashboard(tenantId: string, dashboardId: string, userId?: string) {
    const dashboard = await prisma.analyticsDashboard.findFirst({
      where: {
        id: dashboardId,
        tenantId,
        isActive: true
      },
      include: {
        creator: true,
        widgets: {
          where: { isActive: true },
          orderBy: [
            { position: 'asc' }
          ]
        },
        shares: {
          where: { isActive: true },
          include: {
            user: true
          }
        }
      }
    });

    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // Check access permissions
    const hasAccess = dashboard.isPublic || 
                     dashboard.createdBy === userId ||
                     dashboard.shares.some(share => share.sharedWith === userId);

    if (!hasAccess) {
      throw new Error('Access denied to dashboard');
    }

    return dashboard;
  }

  async updateDashboard(tenantId: string, dashboardId: string, userId: string, updates: Partial<DashboardConfig>) {
    // Check if user has edit permissions
    const dashboard = await prisma.analyticsDashboard.findFirst({
      where: {
        id: dashboardId,
        tenantId,
        OR: [
          { createdBy: userId },
          {
            shares: {
              some: {
                sharedWith: userId,
                permissions: {
                  path: ['edit'],
                  equals: true
                }
              }
            }
          }
        ]
      }
    });

    if (!dashboard) {
      throw new Error('Dashboard not found or no edit permissions');
    }

    return await prisma.analyticsDashboard.update({
      where: { id: dashboardId },
      data: updates
    });
  }

  async deleteDashboard(tenantId: string, dashboardId: string, userId: string) {
    const dashboard = await prisma.analyticsDashboard.findFirst({
      where: {
        id: dashboardId,
        tenantId,
        createdBy: userId
      }
    });

    if (!dashboard) {
      throw new Error('Dashboard not found or not owner');
    }

    await prisma.analyticsDashboard.update({
      where: { id: dashboardId },
      data: { isActive: false }
    });
  }

  // Widget Management
  async addWidget(tenantId: string, dashboardId: string, userId: string, config: WidgetConfig) {
    // Check dashboard permissions
    await this.getDashboard(tenantId, dashboardId, userId);

    return await prisma.analyticsWidget.create({
      data: {
        ...config,
        dashboardId
      }
    });
  }

  async updateWidget(tenantId: string, widgetId: string, userId: string, updates: Partial<WidgetConfig>) {
    const widget = await prisma.analyticsWidget.findFirst({
      where: { id: widgetId },
      include: {
        dashboard: true
      }
    });

    if (!widget || widget.dashboard.tenantId !== tenantId) {
      throw new Error('Widget not found');
    }

    // Check dashboard permissions
    await this.getDashboard(tenantId, widget.dashboardId, userId);

    return await prisma.analyticsWidget.update({
      where: { id: widgetId },
      data: updates
    });
  }

  async deleteWidget(tenantId: string, widgetId: string, userId: string) {
    const widget = await prisma.analyticsWidget.findFirst({
      where: { id: widgetId },
      include: { dashboard: true }
    });

    if (!widget || widget.dashboard.tenantId !== tenantId) {
      throw new Error('Widget not found');
    }

    await this.getDashboard(tenantId, widget.dashboardId, userId);

    await prisma.analyticsWidget.update({
      where: { id: widgetId },
      data: { isActive: false }
    });
  }

  async getWidgetData(tenantId: string, widgetId: string, userId: string, timeRange?: { start: Date; end: Date }) {
    const widget = await prisma.analyticsWidget.findFirst({
      where: { id: widgetId },
      include: { dashboard: true }
    });

    if (!widget || widget.dashboard.tenantId !== tenantId) {
      throw new Error('Widget not found');
    }

    await this.getDashboard(tenantId, widget.dashboardId, userId);

    // Generate widget data based on type and data source
    return await this.generateWidgetData(widget, timeRange);
  }

  private async generateWidgetData(widget: any, timeRange?: { start: Date; end: Date }) {
    const { type, dataSource } = widget;

    switch (type) {
      case 'METRIC':
        return await this.generateMetricData(dataSource, timeRange);
      case 'LINE_CHART':
        return await this.generateTimeSeriesData(dataSource, timeRange);
      case 'BAR_CHART':
        return await this.generateBarChartData(dataSource, timeRange);
      case 'PIE_CHART':
        return await this.generatePieChartData(dataSource, timeRange);
      case 'TABLE':
        return await this.generateTableData(dataSource, timeRange);
      case 'FUNNEL':
        return await this.generateFunnelData(dataSource, timeRange);
      case 'COHORT':
        return await this.generateCohortData(dataSource, timeRange);
      default:
        return { data: [], metadata: { type, message: 'Widget type not implemented' } };
    }
  }

  private async generateMetricData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    // Simulate metric calculation
    const value = Math.floor(Math.random() * 10000);
    const previousValue = Math.floor(Math.random() * 10000);
    const change = ((value - previousValue) / previousValue) * 100;

    return {
      value,
      change,
      trend: change > 0 ? 'up' : 'down',
      unit: dataSource.unit || '',
      format: dataSource.format || 'number'
    };
  }

  private async generateTimeSeriesData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    const data = [];
    const days = 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        timestamp: date.toISOString(),
        value: Math.floor(Math.random() * 1000) + 500
      });
    }

    return { data, metadata: { period: 'daily', count: data.length } };
  }

  private async generateBarChartData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    const categories = ['Events', 'Donations', 'Members', 'Messages', 'Content'];
    const data = categories.map(category => ({
      category,
      value: Math.floor(Math.random() * 1000) + 100
    }));

    return { data, metadata: { categories: categories.length } };
  }

  private async generatePieChartData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    const segments = [
      { label: 'Desktop', value: 45, color: '#FF6B6B' },
      { label: 'Mobile', value: 35, color: '#4ECDC4' },
      { label: 'Tablet', value: 20, color: '#45B7D1' }
    ];

    return { data: segments, metadata: { total: 100 } };
  }

  private async generateTableData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    const data = [
      { name: 'Event A', attendees: 150, revenue: 5000, satisfaction: 4.5 },
      { name: 'Event B', attendees: 200, revenue: 7500, satisfaction: 4.2 },
      { name: 'Event C', attendees: 120, revenue: 4000, satisfaction: 4.8 },
      { name: 'Event D', attendees: 180, revenue: 6200, satisfaction: 4.0 }
    ];

    return { data, metadata: { columns: Object.keys(data[0]), rows: data.length } };
  }

  private async generateFunnelData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    const steps = [
      { name: 'Visited Site', count: 10000, percentage: 100 },
      { name: 'Viewed Events', count: 5000, percentage: 50 },
      { name: 'Started Registration', count: 2000, percentage: 20 },
      { name: 'Completed Registration', count: 1500, percentage: 15 },
      { name: 'Made Donation', count: 500, percentage: 5 }
    ];

    return { data: steps, metadata: { conversionRate: 5, totalSteps: steps.length } };
  }

  private async generateCohortData(dataSource: any, timeRange?: { start: Date; end: Date }) {
    const cohorts = [
      { cohort: '2024-01', size: 100, periods: [100, 65, 45, 35, 30, 25] },
      { cohort: '2024-02', size: 120, periods: [120, 80, 55, 42, 38] },
      { cohort: '2024-03', size: 150, periods: [150, 95, 70, 58] },
      { cohort: '2024-04', size: 180, periods: [180, 120, 90] },
      { cohort: '2024-05', size: 200, periods: [200, 140] },
      { cohort: '2024-06', size: 220, periods: [220] }
    ];

    return { data: cohorts, metadata: { periods: 6, avgRetention: 0.65 } };
  }

  // Metrics Management
  async createMetric(tenantId: string, userId: string, config: MetricConfig) {
    return await prisma.analyticsMetric.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getMetrics(tenantId: string, category?: string) {
    const where: any = { tenantId, isActive: true };
    if (category) where.category = category;

    return await prisma.analyticsMetric.findMany({
      where,
      include: {
        creator: true,
        _count: {
          select: { values: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async calculateMetric(tenantId: string, metricId: string, dimensions?: Record<string, any>) {
    const metric = await prisma.analyticsMetric.findFirst({
      where: { id: metricId, tenantId }
    });

    if (!metric) {
      throw new Error('Metric not found');
    }

    // Execute metric calculation based on formula
    const value = await this.executeMetricFormula(metric, dimensions);

    // Store metric value
    await prisma.metricValue.create({
      data: {
        metricId,
        value,
        dimensions: dimensions || {},
        timestamp: new Date()
      }
    });

    return { metricId, value, timestamp: new Date() };
  }

  private async executeMetricFormula(metric: any, dimensions?: Record<string, any>): Promise<number> {
    // Simulate metric calculation based on type and formula
    switch (metric.type) {
      case 'COUNT':
        return Math.floor(Math.random() * 1000) + 100;
      case 'SUM':
        return Math.floor(Math.random() * 10000) + 1000;
      case 'AVG':
        return Math.random() * 100 + 50;
      case 'RATIO':
        return Math.random();
      case 'PERCENTAGE':
        return Math.random() * 100;
      case 'GROWTH_RATE':
        return (Math.random() - 0.5) * 20; // -10% to +10%
      default:
        return Math.random() * 1000;
    }
  }

  async getMetricValues(tenantId: string, metricId: string, timeRange?: { start: Date; end: Date }) {
    const where: any = { metricId };
    
    if (timeRange) {
      where.timestamp = {
        gte: timeRange.start,
        lte: timeRange.end
      };
    }

    return await prisma.metricValue.findMany({
      where,
      include: {
        metric: true
      },
      orderBy: { timestamp: 'asc' },
      take: 1000 // Limit to prevent large responses
    });
  }

  // Query Management
  async createQuery(tenantId: string, userId: string, config: QueryConfig) {
    return await prisma.analyticsQuery.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async executeQuery(tenantId: string, queryId: string, parameters?: Record<string, any>) {
    const query = await prisma.analyticsQuery.findFirst({
      where: { id: queryId, tenantId }
    });

    if (!query) {
      throw new Error('Query not found');
    }

    const execution = await prisma.queryExecution.create({
      data: {
        queryId,
        status: 'RUNNING'
      }
    });

    try {
      const startTime = Date.now();
      const results = await this.executeAnalyticsQuery(query, parameters);
      const executionTime = (Date.now() - startTime) / 1000;

      await prisma.queryExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          results,
          resultCount: Array.isArray(results) ? results.length : 1,
          executionTime,
          completedAt: new Date()
        }
      });

      return { executionId: execution.id, results, executionTime };

    } catch (error) {
      await prisma.queryExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: error.message,
          completedAt: new Date()
        }
      });

      throw error;
    }
  }

  private async executeAnalyticsQuery(query: any, parameters?: Record<string, any>) {
    // Simulate query execution based on type
    switch (query.type) {
      case 'SQL':
        return await this.executeSQLQuery(query.query, parameters);
      case 'AGGREGATION':
        return await this.executeAggregationQuery(query.query, parameters);
      case 'TIME_SERIES':
        return await this.executeTimeSeriesQuery(query.query, parameters);
      default:
        throw new Error(`Unsupported query type: ${query.type}`);
    }
  }

  private async executeSQLQuery(sql: string, parameters?: Record<string, any>) {
    // In production, this would execute against the actual database
    // with proper parameter substitution and security measures
    console.log('Executing SQL:', sql, parameters);
    
    return [
      { id: 1, name: 'Sample Result 1', value: 100 },
      { id: 2, name: 'Sample Result 2', value: 200 }
    ];
  }

  private async executeAggregationQuery(query: string, parameters?: Record<string, any>) {
    return {
      total: 1000,
      average: 50,
      count: 20,
      max: 150,
      min: 10
    };
  }

  private async executeTimeSeriesQuery(query: string, parameters?: Record<string, any>) {
    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        timestamp: date.toISOString(),
        value: Math.floor(Math.random() * 1000)
      });
    }
    return data.reverse();
  }

  // Alert Management
  async createAlert(tenantId: string, userId: string, config: AlertConfig) {
    return await prisma.analyticsAlert.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });
  }

  async getAlerts(tenantId: string) {
    return await prisma.analyticsAlert.findMany({
      where: { tenantId, isActive: true },
      include: {
        metric: true,
        creator: true,
        triggers: {
          where: { resolved: false },
          orderBy: { triggeredAt: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async checkAlerts(tenantId: string) {
    const alerts = await prisma.analyticsAlert.findMany({
      where: { tenantId, isActive: true },
      include: { metric: true }
    });

    const triggeredAlerts = [];

    for (const alert of alerts) {
      if (alert.metricId) {
        const latestValue = await prisma.metricValue.findFirst({
          where: { metricId: alert.metricId },
          orderBy: { timestamp: 'desc' }
        });

        if (latestValue && this.evaluateAlertCondition(alert, latestValue.value)) {
          const trigger = await prisma.alertTrigger.create({
            data: {
              alertId: alert.id,
              metricValue: latestValue.value,
              threshold: alert.threshold || 0,
              condition: JSON.stringify(alert.condition)
            }
          });

          await prisma.analyticsAlert.update({
            where: { id: alert.id },
            data: {
              lastTriggered: new Date(),
              triggerCount: { increment: 1 }
            }
          });

          triggeredAlerts.push({ alert, trigger });
        }
      }
    }

    return triggeredAlerts;
  }

  private evaluateAlertCondition(alert: any, value: number): boolean {
    const { condition, threshold } = alert;
    
    if (!threshold) return false;

    switch (condition.operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  // Advanced Analytics
  async createCohortAnalysis(tenantId: string, userId: string, config: CohortConfig) {
    const cohort = await prisma.cohortAnalysis.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });

    // Execute cohort analysis
    this.executeCohortAnalysis(cohort.id).catch(console.error);

    return cohort;
  }

  private async executeCohortAnalysis(cohortId: string) {
    const cohort = await prisma.cohortAnalysis.findUnique({
      where: { id: cohortId }
    });

    if (!cohort) return;

    try {
      // Simulate cohort analysis calculation
      const results = await this.calculateCohortResults(cohort);

      await prisma.cohortAnalysis.update({
        where: { id: cohortId },
        data: {
          results,
          lastRun: new Date()
        }
      });

    } catch (error) {
      console.error('Cohort analysis failed:', error);
    }
  }

  private async calculateCohortResults(cohort: any) {
    // Simulate cohort calculation
    const periods = cohort.periods || 12;
    const cohorts = [];

    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      
      const size = Math.floor(Math.random() * 200) + 50;
      const retentionRates = [];
      
      for (let p = 0; p < periods && p <= i; p++) {
        const rate = Math.max(0.1, 1 - (p * 0.15) - Math.random() * 0.1);
        retentionRates.push(Math.floor(size * rate));
      }

      cohorts.push({
        period: month.toISOString().substring(0, 7),
        size,
        retention: retentionRates
      });
    }

    return { cohorts: cohorts.reverse() };
  }

  async createFunnelAnalysis(tenantId: string, userId: string, config: FunnelConfig) {
    const funnel = await prisma.funnelAnalysis.create({
      data: {
        ...config,
        tenantId,
        createdBy: userId
      }
    });

    this.executeFunnelAnalysis(funnel.id).catch(console.error);

    return funnel;
  }

  private async executeFunnelAnalysis(funnelId: string) {
    const funnel = await prisma.funnelAnalysis.findUnique({
      where: { id: funnelId }
    });

    if (!funnel) return;

    try {
      const results = await this.calculateFunnelResults(funnel);

      await prisma.funnelAnalysis.update({
        where: { id: funnelId },
        data: {
          results,
          conversionRate: results.overallConversion,
          lastRun: new Date()
        }
      });

    } catch (error) {
      console.error('Funnel analysis failed:', error);
    }
  }

  private async calculateFunnelResults(funnel: any) {
    const steps = funnel.steps || [];
    let currentCount = 10000; // Starting count

    const funnelData = steps.map((step: any, index: number) => {
      if (index > 0) {
        // Simulate drop-off at each step
        currentCount = Math.floor(currentCount * (0.7 + Math.random() * 0.2));
      }

      return {
        step: step.name,
        count: currentCount,
        percentage: index === 0 ? 100 : (currentCount / 10000) * 100,
        conversionFromPrevious: index === 0 ? 100 : (currentCount / (steps[index-1]?.count || currentCount)) * 100
      };
    });

    const overallConversion = funnelData.length > 0 
      ? (funnelData[funnelData.length - 1].count / funnelData[0].count) * 100 
      : 0;

    return {
      steps: funnelData,
      overallConversion
    };
  }

  // Dashboard Sharing
  async shareDashboard(tenantId: string, dashboardId: string, userId: string, shareConfig: {
    sharedWith?: string;
    permissions: Record<string, any>;
    expiresAt?: Date;
  }) {
    const dashboard = await prisma.analyticsDashboard.findFirst({
      where: {
        id: dashboardId,
        tenantId,
        createdBy: userId
      }
    });

    if (!dashboard) {
      throw new Error('Dashboard not found or not owner');
    }

    const shareToken = Math.random().toString(36).substring(2, 15);

    return await prisma.dashboardShare.create({
      data: {
        dashboardId,
        sharedWith: shareConfig.sharedWith,
        shareToken,
        permissions: shareConfig.permissions,
        expiresAt: shareConfig.expiresAt,
        createdBy: userId
      }
    });
  }

  // Analytics Summary
  async getAnalyticsSummary(tenantId: string) {
    const [
      dashboardCount,
      metricCount,
      queryCount,
      alertCount,
      recentExecutions
    ] = await Promise.all([
      prisma.analyticsDashboard.count({
        where: { tenantId, isActive: true }
      }),
      prisma.analyticsMetric.count({
        where: { tenantId, isActive: true }
      }),
      prisma.analyticsQuery.count({
        where: { tenantId, isActive: true }
      }),
      prisma.analyticsAlert.count({
        where: { tenantId, isActive: true }
      }),
      prisma.queryExecution.findMany({
        where: {
          query: { tenantId }
        },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: {
          query: true
        }
      })
    ]);

    return {
      dashboards: dashboardCount,
      metrics: metricCount,
      queries: queryCount,
      alerts: alertCount,
      recentExecutions
    };
  }
}