import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { AdvancedAnalyticsService } from "../services/advancedAnalytics";

const advancedAnalyticsService = new AdvancedAnalyticsService();

const dashboardConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  layout: z.any().default({}),
  config: z.any().default({}),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

const widgetConfigSchema = z.object({
  dashboardId: z.string(),
  name: z.string(),
  type: z.enum(['line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'bubble', 'heatmap', 'gauge', 'metric', 'table', 'funnel', 'waterfall', 'sankey', 'treemap', 'radar']),
  config: z.any().default({}),
  query: z.any().default({}),
  position: z.any().default({}),
  size: z.any().default({})
});

const metricConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['count', 'sum', 'average', 'min', 'max', 'percentage', 'ratio', 'growth_rate', 'conversion_rate', 'custom']),
  config: z.any().default({}),
  query: z.any().default({}),
  schedule: z.string().optional(),
  isActive: z.boolean().default(true)
});

const queryConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['sql', 'aggregation', 'time_series', 'cohort', 'funnel', 'retention', 'segment']),
  query: z.any(),
  config: z.any().default({}),
  schedule: z.string().optional(),
  isActive: z.boolean().default(true)
});

const alertConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  metricId: z.string(),
  condition: z.any(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  config: z.any().default({}),
  isActive: z.boolean().default(true)
});

export const advancedAnalyticsRouter = router({
  // Dashboard Management
  createDashboard: protectedProcedure
    .input(dashboardConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.createDashboard(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getDashboards: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      tags: z.array(z.string()).optional()
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getDashboards(
        ctx.user.tenantId,
        input
      );
    }),

  getDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getDashboard(
        ctx.user.tenantId,
        input.dashboardId
      );
    }),

  updateDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      config: dashboardConfigSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.updateDashboard(
        ctx.user.tenantId,
        input.dashboardId,
        input.config
      );
    }),

  deleteDashboard: protectedProcedure
    .input(z.object({ dashboardId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.deleteDashboard(
        ctx.user.tenantId,
        input.dashboardId
      );
    }),

  shareDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      shareType: z.enum(['view', 'edit']),
      expiresAt: z.date().optional(),
      password: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.shareDashboard(
        ctx.user.tenantId,
        input.dashboardId,
        ctx.user.id,
        input
      );
    }),

  // Widget Management
  addWidget: protectedProcedure
    .input(widgetConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.addWidget(
        ctx.user.tenantId,
        input
      );
    }),

  updateWidget: protectedProcedure
    .input(z.object({
      widgetId: z.string(),
      config: widgetConfigSchema.partial()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.updateWidget(
        ctx.user.tenantId,
        input.widgetId,
        input.config
      );
    }),

  removeWidget: protectedProcedure
    .input(z.object({ widgetId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.removeWidget(
        ctx.user.tenantId,
        input.widgetId
      );
    }),

  getWidgetData: protectedProcedure
    .input(z.object({
      widgetId: z.string(),
      timeRange: z.object({
        start: z.date(),
        end: z.date()
      }).optional(),
      filters: z.any().optional()
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getWidgetData(
        ctx.user.tenantId,
        input.widgetId,
        input
      );
    }),

  // Metrics Management
  createMetric: protectedProcedure
    .input(metricConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.createMetric(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getMetrics: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      type: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getMetrics(
        ctx.user.tenantId,
        input
      );
    }),

  calculateMetric: protectedProcedure
    .input(z.object({
      metricId: z.string(),
      timeRange: z.object({
        start: z.date(),
        end: z.date()
      }).optional(),
      filters: z.any().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.calculateMetric(
        ctx.user.tenantId,
        input.metricId,
        input
      );
    }),

  getMetricHistory: protectedProcedure
    .input(z.object({
      metricId: z.string(),
      timeRange: z.object({
        start: z.date(),
        end: z.date()
      }),
      granularity: z.enum(['hour', 'day', 'week', 'month']).default('day')
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getMetricHistory(
        ctx.user.tenantId,
        input.metricId,
        input
      );
    }),

  // Query Management
  createQuery: protectedProcedure
    .input(queryConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.createQuery(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  executeQuery: protectedProcedure
    .input(z.object({
      queryId: z.string(),
      parameters: z.any().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.executeQuery(
        ctx.user.tenantId,
        input.queryId,
        input.parameters
      );
    }),

  getQueryHistory: protectedProcedure
    .input(z.object({
      queryId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getQueryHistory(
        ctx.user.tenantId,
        input.queryId,
        input
      );
    }),

  // Alert Management
  createAlert: protectedProcedure
    .input(alertConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.createAlert(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getAlerts: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      severity: z.string().optional(),
      isActive: z.boolean().optional()
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getAlerts(
        ctx.user.tenantId,
        input
      );
    }),

  evaluateAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.evaluateAlert(
        ctx.user.tenantId,
        input.alertId
      );
    }),

  getAlertHistory: protectedProcedure
    .input(z.object({
      alertId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getAlertHistory(
        ctx.user.tenantId,
        input.alertId,
        input
      );
    }),

  // Advanced Analytics
  performCohortAnalysis: protectedProcedure
    .input(z.object({
      config: z.object({
        cohortType: z.enum(['acquisition', 'behavioral']),
        event: z.string(),
        periodType: z.enum(['day', 'week', 'month']),
        periods: z.number(),
        filters: z.any().optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.performCohortAnalysis(
        ctx.user.tenantId,
        ctx.user.id,
        input.config
      );
    }),

  performFunnelAnalysis: protectedProcedure
    .input(z.object({
      config: z.object({
        steps: z.array(z.any()),
        timeWindow: z.number(),
        filters: z.any().optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.performFunnelAnalysis(
        ctx.user.tenantId,
        ctx.user.id,
        input.config
      );
    }),

  performRetentionAnalysis: protectedProcedure
    .input(z.object({
      config: z.object({
        initialEvent: z.string(),
        returnEvent: z.string(),
        periodType: z.enum(['day', 'week', 'month']),
        periods: z.number(),
        filters: z.any().optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.performRetentionAnalysis(
        ctx.user.tenantId,
        ctx.user.id,
        input.config
      );
    }),

  performSegmentAnalysis: protectedProcedure
    .input(z.object({
      config: z.object({
        dimensions: z.array(z.string()),
        metrics: z.array(z.string()),
        filters: z.any().optional(),
        clustering: z.any().optional()
      })
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.performSegmentAnalysis(
        ctx.user.tenantId,
        ctx.user.id,
        input.config
      );
    }),

  // Data Export
  exportDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      format: z.enum(['pdf', 'png', 'xlsx', 'csv']),
      config: z.any().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.exportDashboard(
        ctx.user.tenantId,
        input.dashboardId,
        input.format,
        input.config
      );
    }),

  exportData: protectedProcedure
    .input(z.object({
      queryId: z.string(),
      format: z.enum(['csv', 'xlsx', 'json']),
      filters: z.any().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.exportData(
        ctx.user.tenantId,
        input.queryId,
        input.format,
        input.filters
      );
    }),

  // Analytics Overview
  getOverview: protectedProcedure
    .input(z.object({
      timeRange: z.object({
        start: z.date(),
        end: z.date()
      }).optional()
    }))
    .query(async ({ input, ctx }) => {
      return await advancedAnalyticsService.getAnalyticsOverview(
        ctx.user.tenantId,
        input.timeRange
      );
    }),

  // Admin Functions
  getSystemMetrics: adminProcedure
    .query(async ({ ctx }) => {
      return await advancedAnalyticsService.getSystemMetrics();
    }),

  optimizeQueries: adminProcedure
    .mutation(async ({ ctx }) => {
      return await advancedAnalyticsService.optimizeQueries();
    }),

  cleanupOldData: adminProcedure
    .input(z.object({
      retentionDays: z.number().default(90)
    }))
    .mutation(async ({ input, ctx }) => {
      return await advancedAnalyticsService.cleanupOldData(input.retentionDays);
    })
});