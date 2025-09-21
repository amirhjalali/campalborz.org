import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { PerformanceMonitoringService } from "../services/performanceMonitoring";

const performanceMonitoringService = new PerformanceMonitoringService();

const metricConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_io', 'database_query_time', 'cache_hit_rate', 'queue_size', 'connection_pool_usage', 'gc_time', 'heap_usage', 'thread_count', 'custom']),
  value: z.number(),
  unit: z.string(),
  tags: z.any().optional(),
  metadata: z.any().optional(),
  source: z.string(),
  environment: z.string().optional()
});

const traceConfigSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string().optional(),
  operationName: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  duration: z.number(),
  status: z.enum(['ok', 'error', 'timeout', 'cancelled']),
  tags: z.any().optional(),
  logs: z.array(z.any()).optional(),
  errors: z.array(z.any()).optional(),
  metricId: z.string().optional()
});

const alertConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  metricType: z.enum(['response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_io', 'database_query_time', 'cache_hit_rate', 'queue_size', 'connection_pool_usage', 'gc_time', 'heap_usage', 'thread_count', 'custom']),
  condition: z.any(),
  threshold: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  config: z.any().optional()
});

const healthCheckConfigSchema = z.object({
  service: z.string(),
  endpoint: z.string(),
  status: z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']),
  responseTime: z.number(),
  statusCode: z.number().optional(),
  message: z.string().optional(),
  metadata: z.any().optional()
});

const profileConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['cpu', 'memory', 'heap', 'flame_graph', 'call_stack', 'allocation']),
  data: z.any(),
  duration: z.number(),
  metadata: z.any().optional()
});

const resourceUsageConfigSchema = z.object({
  resourceType: z.enum(['cpu', 'memory', 'disk', 'network', 'database_connections', 'cache_memory', 'queue_size', 'thread_pool', 'file_descriptors', 'custom']),
  usage: z.number(),
  limit: z.number().optional(),
  unit: z.string(),
  metadata: z.any().optional()
});

const benchmarkConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['load_test', 'stress_test', 'spike_test', 'volume_test', 'endurance_test', 'scalability_test', 'performance_regression', 'custom']),
  config: z.any().optional(),
  results: z.any().optional(),
  baseline: z.any().optional(),
  score: z.number().optional(),
  passed: z.boolean().optional()
});

export const performanceMonitoringRouter = router({
  // Metrics Management
  recordMetric: protectedProcedure
    .input(metricConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.recordMetric(
        ctx.user.tenantId,
        input
      );
    }),

  getMetrics: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      name: z.string().optional(),
      source: z.string().optional(),
      environment: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getMetrics(
        ctx.user.tenantId,
        input
      );
    }),

  getMetricAggregations: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      name: z.string().optional(),
      groupBy: z.enum(['hour', 'day', 'week', 'month']),
      startTime: z.date(),
      endTime: z.date()
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getMetricAggregations(
        ctx.user.tenantId,
        input
      );
    }),

  // Tracing Management
  createTrace: protectedProcedure
    .input(traceConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.createTrace(
        ctx.user.tenantId,
        input
      );
    }),

  getTraces: protectedProcedure
    .input(z.object({
      traceId: z.string().optional(),
      operationName: z.string().optional(),
      status: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      minDuration: z.number().optional(),
      maxDuration: z.number().optional(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getTraces(
        ctx.user.tenantId,
        input
      );
    }),

  getTraceStats: protectedProcedure
    .input(z.object({
      startTime: z.date(),
      endTime: z.date()
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getTracesByOperationStats(
        ctx.user.tenantId,
        input
      );
    }),

  // Alert Management
  createAlert: protectedProcedure
    .input(alertConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.createAlert(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getAlerts: protectedProcedure
    .input(z.object({
      isActive: z.boolean().optional(),
      severity: z.string().optional(),
      metricType: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getAlerts(
        ctx.user.tenantId,
        input
      );
    }),

  evaluateAlert: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.evaluateAlert(
        ctx.user.tenantId,
        input.alertId
      );
    }),

  // Health Monitoring
  recordHealthCheck: protectedProcedure
    .input(healthCheckConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.recordHealthCheck(
        ctx.user.tenantId,
        input
      );
    }),

  getHealthChecks: protectedProcedure
    .input(z.object({
      service: z.string().optional(),
      status: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getHealthChecks(
        ctx.user.tenantId,
        input
      );
    }),

  getSystemOverview: protectedProcedure
    .query(async ({ ctx }) => {
      return await performanceMonitoringService.getSystemOverview(
        ctx.user.tenantId
      );
    }),

  // Performance Profiling
  createProfile: protectedProcedure
    .input(profileConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.createProfile(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  getProfiles: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getProfiles(
        ctx.user.tenantId,
        input
      );
    }),

  // Resource Usage Monitoring
  recordResourceUsage: protectedProcedure
    .input(resourceUsageConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.recordResourceUsage(
        ctx.user.tenantId,
        input
      );
    }),

  getResourceUsage: protectedProcedure
    .input(z.object({
      resourceType: z.string().optional(),
      startTime: z.date().optional(),
      endTime: z.date().optional(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getResourceUsage(
        ctx.user.tenantId,
        input
      );
    }),

  // Benchmarking
  createBenchmark: protectedProcedure
    .input(benchmarkConfigSchema)
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.createBenchmark(
        ctx.user.tenantId,
        ctx.user.id,
        input
      );
    }),

  runBenchmark: protectedProcedure
    .input(z.object({ benchmarkId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.runBenchmark(
        ctx.user.tenantId,
        input.benchmarkId
      );
    }),

  getBenchmarks: protectedProcedure
    .input(z.object({
      type: z.string().optional(),
      passed: z.boolean().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ input, ctx }) => {
      return await performanceMonitoringService.getBenchmarks(
        ctx.user.tenantId,
        input
      );
    }),

  // Reporting and Analytics
  generateReport: protectedProcedure
    .input(z.object({
      startTime: z.date(),
      endTime: z.date()
    }))
    .mutation(async ({ input, ctx }) => {
      return await performanceMonitoringService.generatePerformanceReport(
        ctx.user.tenantId,
        input
      );
    }),

  // Real-time Monitoring
  getRealtimeMetrics: protectedProcedure
    .input(z.object({
      types: z.array(z.string()).optional(),
      limit: z.number().default(100)
    }))
    .query(async ({ input, ctx }) => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      return await performanceMonitoringService.getMetrics(
        ctx.user.tenantId,
        {
          startTime: fiveMinutesAgo,
          endTime: new Date(),
          limit: input.limit
        }
      );
    }),

  // APM Integration
  sendAPMData: protectedProcedure
    .input(z.object({
      metrics: z.array(metricConfigSchema).optional(),
      traces: z.array(traceConfigSchema).optional(),
      healthChecks: z.array(healthCheckConfigSchema).optional(),
      resourceUsage: z.array(resourceUsageConfigSchema).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const results: any = {};

      if (input.metrics) {
        results.metrics = await Promise.all(
          input.metrics.map(metric => 
            performanceMonitoringService.recordMetric(ctx.user.tenantId, metric)
          )
        );
      }

      if (input.traces) {
        results.traces = await Promise.all(
          input.traces.map(trace => 
            performanceMonitoringService.createTrace(ctx.user.tenantId, trace)
          )
        );
      }

      if (input.healthChecks) {
        results.healthChecks = await Promise.all(
          input.healthChecks.map(check => 
            performanceMonitoringService.recordHealthCheck(ctx.user.tenantId, check)
          )
        );
      }

      if (input.resourceUsage) {
        results.resourceUsage = await Promise.all(
          input.resourceUsage.map(usage => 
            performanceMonitoringService.recordResourceUsage(ctx.user.tenantId, usage)
          )
        );
      }

      return results;
    }),

  // Performance Insights
  getPerformanceInsights: protectedProcedure
    .input(z.object({
      timeRange: z.object({
        start: z.date(),
        end: z.date()
      }).optional()
    }))
    .query(async ({ input, ctx }) => {
      const timeRange = input.timeRange || {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      };

      const [overview, traceStats] = await Promise.all([
        performanceMonitoringService.getSystemOverview(ctx.user.tenantId),
        performanceMonitoringService.getTracesByOperationStats(ctx.user.tenantId, timeRange)
      ]);

      return {
        overview,
        traceStats,
        timeRange,
        insights: {
          topOperations: traceStats.slice(0, 5),
          slowestOperations: traceStats.sort((a: any, b: any) => b.avg_duration - a.avg_duration).slice(0, 5),
          errorProneOperations: traceStats.filter((t: any) => t.error_rate > 1).slice(0, 5)
        }
      };
    }),

  // Admin Functions
  cleanupOldData: adminProcedure
    .input(z.object({
      retentionDays: z.number().default(30)
    }))
    .mutation(async ({ input }) => {
      return await performanceMonitoringService.cleanupOldData(input.retentionDays);
    }),

  getSystemStats: adminProcedure
    .query(async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      return {
        totalMetrics: await performanceMonitoringService.getMetrics('system', {
          startTime: oneHourAgo,
          limit: 1
        }),
        systemHealth: await performanceMonitoringService.getSystemOverview('system'),
        timestamp: new Date()
      };
    })
});