import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { ReportingService } from "../services/reporting";
import { TRPCError } from "@trpc/server";

const reportingService = new ReportingService();

export const reportingRouter = router({
  createReport: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      type: z.enum(['chart', 'table', 'dashboard', 'custom']),
      query: z.string(),
      visualization: z.object({
        type: z.enum(['bar', 'line', 'pie', 'table', 'gauge', 'heatmap']),
        config: z.record(z.any())
      }),
      parameters: z.array(z.object({
        name: z.string(),
        type: z.enum(['string', 'number', 'date', 'boolean']),
        required: z.boolean(),
        defaultValue: z.any().optional()
      })).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.createReport(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create report'
        });
      }
    }),

  executeReport: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      parameters: z.record(z.any()).optional(),
      format: z.enum(['json', 'csv', 'xlsx', 'pdf']).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.executeReport(ctx.session.user.activeTenantId!, input.reportId, input.parameters);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute report'
        });
      }
    }),

  getReports: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getReports(ctx.session.user.activeTenantId!, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch reports'
        });
      }
    }),

  getReport: protectedProcedure
    .input(z.object({
      reportId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getReport(ctx.session.user.activeTenantId!, input.reportId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch report'
        });
      }
    }),

  updateReport: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      query: z.string().optional(),
      visualization: z.object({
        type: z.enum(['bar', 'line', 'pie', 'table', 'gauge', 'heatmap']),
        config: z.record(z.any())
      }).optional(),
      parameters: z.array(z.object({
        name: z.string(),
        type: z.enum(['string', 'number', 'date', 'boolean']),
        required: z.boolean(),
        defaultValue: z.any().optional()
      })).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { reportId, ...updateData } = input;
        return await reportingService.updateReport(ctx.session.user.activeTenantId!, reportId, updateData, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update report'
        });
      }
    }),

  deleteReport: protectedProcedure
    .input(z.object({
      reportId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await reportingService.deleteReport(ctx.session.user.activeTenantId!, input.reportId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete report'
        });
      }
    }),

  createDashboard: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      layout: z.object({
        rows: z.number(),
        columns: z.number(),
        widgets: z.array(z.object({
          id: z.string(),
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          reportId: z.string(),
          title: z.string().optional(),
          config: z.record(z.any()).optional()
        }))
      }),
      isPublic: z.boolean().default(false),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.createDashboard(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create dashboard'
        });
      }
    }),

  getDashboards: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getDashboards(ctx.session.user.activeTenantId!, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboards'
        });
      }
    }),

  getDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getDashboard(ctx.session.user.activeTenantId!, input.dashboardId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch dashboard'
        });
      }
    }),

  updateDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      layout: z.object({
        rows: z.number(),
        columns: z.number(),
        widgets: z.array(z.object({
          id: z.string(),
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
          reportId: z.string(),
          title: z.string().optional(),
          config: z.record(z.any()).optional()
        }))
      }).optional(),
      isPublic: z.boolean().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { dashboardId, ...updateData } = input;
        return await reportingService.updateDashboard(ctx.session.user.activeTenantId!, dashboardId, updateData, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update dashboard'
        });
      }
    }),

  deleteDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await reportingService.deleteDashboard(ctx.session.user.activeTenantId!, input.dashboardId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete dashboard'
        });
      }
    }),

  getAnalyticsOverview: protectedProcedure
    .input(z.object({
      period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
      metrics: z.array(z.string()).optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getAnalyticsOverview(ctx.session.user.activeTenantId!, input.period, input.metrics);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch analytics overview'
        });
      }
    }),

  executeCustomQuery: protectedProcedure
    .input(z.object({
      query: z.string(),
      parameters: z.record(z.any()).optional(),
      maxRows: z.number().default(1000)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.executeCustomQuery(ctx.session.user.activeTenantId!, input.query, input.parameters, input.maxRows);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute custom query'
        });
      }
    }),

  exportReport: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      format: z.enum(['csv', 'xlsx', 'pdf', 'json']),
      parameters: z.record(z.any()).optional(),
      includeCharts: z.boolean().default(true)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.exportReport(ctx.session.user.activeTenantId!, input.reportId, input.format, input.parameters, input.includeCharts);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export report'
        });
      }
    }),

  exportDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      format: z.enum(['pdf', 'png', 'json']),
      includeData: z.boolean().default(true)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.exportDashboard(ctx.session.user.activeTenantId!, input.dashboardId, input.format, input.includeData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export dashboard'
        });
      }
    }),

  createScheduledReport: protectedProcedure
    .input(z.object({
      name: z.string(),
      reportId: z.string(),
      schedule: z.object({
        frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
        time: z.string(),
        timezone: z.string(),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional()
      }),
      recipients: z.array(z.object({
        email: z.string(),
        name: z.string().optional()
      })),
      format: z.enum(['csv', 'xlsx', 'pdf']).default('pdf'),
      parameters: z.record(z.any()).optional(),
      isActive: z.boolean().default(true)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.createScheduledReport(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create scheduled report'
        });
      }
    }),

  getScheduledReports: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getScheduledReports(ctx.session.user.activeTenantId!, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch scheduled reports'
        });
      }
    }),

  updateScheduledReport: protectedProcedure
    .input(z.object({
      scheduledReportId: z.string(),
      name: z.string().optional(),
      schedule: z.object({
        frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
        time: z.string(),
        timezone: z.string(),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional()
      }).optional(),
      recipients: z.array(z.object({
        email: z.string(),
        name: z.string().optional()
      })).optional(),
      format: z.enum(['csv', 'xlsx', 'pdf']).optional(),
      parameters: z.record(z.any()).optional(),
      isActive: z.boolean().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { scheduledReportId, ...updateData } = input;
        return await reportingService.updateScheduledReport(ctx.session.user.activeTenantId!, scheduledReportId, updateData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update scheduled report'
        });
      }
    }),

  deleteScheduledReport: protectedProcedure
    .input(z.object({
      scheduledReportId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await reportingService.deleteScheduledReport(ctx.session.user.activeTenantId!, input.scheduledReportId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete scheduled report'
        });
      }
    }),

  shareReport: protectedProcedure
    .input(z.object({
      reportId: z.string(),
      shareWith: z.array(z.object({
        userId: z.string().optional(),
        email: z.string().optional(),
        permissions: z.enum(['view', 'edit'])
      })),
      expiresAt: z.date().optional(),
      message: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.shareReport(ctx.session.user.activeTenantId!, input.reportId, ctx.session.user.id, input.shareWith, input.expiresAt, input.message);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to share report'
        });
      }
    }),

  shareDashboard: protectedProcedure
    .input(z.object({
      dashboardId: z.string(),
      shareWith: z.array(z.object({
        userId: z.string().optional(),
        email: z.string().optional(),
        permissions: z.enum(['view', 'edit'])
      })),
      expiresAt: z.date().optional(),
      message: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await reportingService.shareDashboard(ctx.session.user.activeTenantId!, input.dashboardId, ctx.session.user.id, input.shareWith, input.expiresAt, input.message);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to share dashboard'
        });
      }
    }),

  getSharedReports: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getSharedReports(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch shared reports'
        });
      }
    }),

  getSharedDashboards: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await reportingService.getSharedDashboards(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch shared dashboards'
        });
      }
    }),

  revokeSharing: protectedProcedure
    .input(z.object({
      shareId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await reportingService.revokeSharing(ctx.session.user.activeTenantId!, input.shareId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to revoke sharing'
        });
      }
    })
});