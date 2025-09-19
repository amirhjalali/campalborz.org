import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createAnalyticsService } from "../services/analytics";

// Analytics schemas
const DateRangeSchema = z.object({
  start: z.date(),
  end: z.date(),
});

const AnalyticsQuerySchema = z.object({
  dateRange: DateRangeSchema,
  events: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  userIds: z.array(z.string()).optional(),
  groupBy: z.enum(["hour", "day", "week", "month"]).optional(),
  metrics: z.array(z.string()).optional(),
});

const TrackEventSchema = z.object({
  event: z.string(),
  category: z.string(),
  properties: z.record(z.any()).optional(),
  sessionId: z.string(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  referrer: z.string().optional(),
  page: z.string().optional(),
});

const TrackGoalSchema = z.object({
  goalName: z.string(),
  value: z.number().optional(),
});

const UserBehaviorSchema = z.object({
  userId: z.string(),
  dateRange: DateRangeSchema,
});

export const analyticsRouter = router({
  // Get comprehensive analytics report
  getReport: protectedProcedure
    .input(AnalyticsQuerySchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions - analytics access for admins and moderators
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics access requires admin or moderator role",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const report = await analyticsService.getReport({
          tenantId: ctx.tenant.id,
          dateRange: input.dateRange,
          events: input.events,
          categories: input.categories,
          userIds: input.userIds,
          groupBy: input.groupBy,
          metrics: input.metrics,
        });

        return report;
      } catch (error) {
        console.error("Analytics report error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate analytics report",
        });
      }
    }),

  // Get realtime analytics
  getRealtime: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics access requires admin or moderator role",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        // Get last hour data for realtime view
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const now = new Date();

        const report = await analyticsService.getReport({
          tenantId: ctx.tenant.id,
          dateRange: { start: oneHourAgo, end: now },
          groupBy: "hour",
        });

        return {
          currentUsers: report.metrics.realtime.currentUsers,
          currentSessions: report.metrics.realtime.currentSessions,
          topPages: report.metrics.realtime.topPages,
          recentEvents: report.metrics.realtime.recentEvents,
          lastUpdated: new Date(),
        };
      } catch (error) {
        console.error("Realtime analytics error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get realtime analytics",
        });
      }
    }),

  // Get overview metrics (simplified for dashboard widgets)
  getOverview: protectedProcedure
    .input(z.object({
      period: z.enum(["7d", "30d", "90d"]).default("30d"),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        // Calculate date range based on period
        const end = new Date();
        const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
        const days = daysMap[input.period];
        const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

        const report = await analyticsService.getReport({
          tenantId: ctx.tenant.id,
          dateRange: { start, end },
          groupBy: "day",
        });

        // Return simplified overview for dashboard
        return {
          totalUsers: report.metrics.overview.totalUsers,
          activeUsers: report.metrics.overview.activeUsers,
          newUsers: report.metrics.overview.newUsers,
          totalSessions: report.metrics.overview.totalSessions,
          pageViews: report.metrics.traffic.pageViews,
          conversionRate: report.metrics.overview.conversionRate,
          averageSessionDuration: report.metrics.overview.averageSessionDuration,
          bounceRate: report.metrics.overview.bounceRate,
          trends: {
            users: report.trends.users.slice(-7), // Last 7 days
            pageViews: report.trends.pageViews.slice(-7),
          },
          topInsights: report.insights.slice(0, 3),
        };
      } catch (error) {
        console.error("Overview analytics error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get analytics overview",
        });
      }
    }),

  // Track analytics event
  track: protectedProcedure
    .input(TrackEventSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const success = await analyticsService.track({
          tenantId: ctx.tenant.id,
          userId: ctx.user?.id,
          sessionId: input.sessionId,
          event: input.event,
          category: input.category,
          properties: input.properties,
          userAgent: input.userAgent,
          ipAddress: input.ipAddress,
          referrer: input.referrer,
          page: input.page,
        });

        return { success };
      } catch (error) {
        console.error("Track event error:", error);
        // Don't throw error for tracking failures to avoid breaking user experience
        return { success: false };
      }
    }),

  // Track goal completion
  trackGoal: protectedProcedure
    .input(TrackGoalSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const success = await analyticsService.trackGoal(
          ctx.tenant.id,
          ctx.user.id,
          input.goalName,
          input.value
        );

        return { success };
      } catch (error) {
        console.error("Track goal error:", error);
        return { success: false };
      }
    }),

  // Get user behavior analysis
  getUserBehavior: protectedProcedure
    .input(UserBehaviorSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions - users can only view their own behavior, admins can view any
      if (input.userId !== ctx.user.id && !["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to view user behavior",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const behavior = await analyticsService.getUserBehavior(
          ctx.tenant.id,
          input.userId,
          input.dateRange
        );

        return behavior;
      } catch (error) {
        console.error("User behavior error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user behavior data",
        });
      }
    }),

  // Get conversion funnel data
  getFunnels: protectedProcedure
    .input(z.object({
      funnelName: z.string().optional(),
      dateRange: DateRangeSchema,
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics access requires admin or moderator role",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const report = await analyticsService.getReport({
          tenantId: ctx.tenant.id,
          dateRange: input.dateRange,
        });

        return {
          funnels: report.metrics.conversion.funnels,
          goals: report.metrics.conversion.goals,
        };
      } catch (error) {
        console.error("Funnels error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get funnel data",
        });
      }
    }),

  // Get traffic sources
  getTrafficSources: protectedProcedure
    .input(z.object({
      dateRange: DateRangeSchema,
      groupBy: z.enum(["source", "medium", "campaign"]).default("source"),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Analytics access requires admin or moderator role",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const report = await analyticsService.getReport({
          tenantId: ctx.tenant.id,
          dateRange: input.dateRange,
        });

        return {
          referrers: report.metrics.traffic.referrers,
          devices: report.metrics.traffic.devices,
          browsers: report.metrics.traffic.browsers,
          topPages: report.metrics.traffic.topPages,
        };
      } catch (error) {
        console.error("Traffic sources error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get traffic sources",
        });
      }
    }),

  // Export analytics data
  exportData: protectedProcedure
    .input(z.object({
      dateRange: DateRangeSchema,
      format: z.enum(["csv", "json"]).default("csv"),
      metrics: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Data export requires admin role",
        });
      }

      try {
        const analyticsService = createAnalyticsService(ctx.prisma);
        
        const report = await analyticsService.getReport({
          tenantId: ctx.tenant.id,
          dateRange: input.dateRange,
          metrics: input.metrics,
        });

        // Generate export data
        const exportData = {
          exportDate: new Date(),
          dateRange: input.dateRange,
          overview: report.metrics.overview,
          traffic: report.metrics.traffic,
          engagement: report.metrics.engagement,
          conversion: report.metrics.conversion,
          trends: report.trends,
        };

        // Helper function to convert data to CSV
        const convertToCSV = (data: any): string => {
          const lines = [];
          lines.push("Metric,Value");
          lines.push(`Total Users,${data.overview.totalUsers}`);
          lines.push(`Active Users,${data.overview.activeUsers}`);
          lines.push(`Page Views,${data.traffic.pageViews}`);
          lines.push(`Sessions,${data.overview.totalSessions}`);
          lines.push(`Conversion Rate,${(data.overview.conversionRate * 100).toFixed(2)}%`);
          return lines.join("\n");
        };

        return {
          data: input.format === "json" ? JSON.stringify(exportData, null, 2) : convertToCSV(exportData),
          filename: `analytics_${input.dateRange.start.toISOString().split('T')[0]}_${input.dateRange.end.toISOString().split('T')[0]}.${input.format}`,
          contentType: input.format === "json" ? "application/json" : "text/csv",
        };
      } catch (error) {
        console.error("Export analytics error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to export analytics data",
        });
      }
    }),
});