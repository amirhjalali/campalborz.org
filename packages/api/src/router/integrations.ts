import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { integrationsService } from "../services/integrations";

// Integration management schemas
const ListIntegrationsSchema = z.object({
  category: z.enum(['email', 'payment', 'analytics', 'social', 'storage', 'communication', 'other']).optional(),
  provider: z.string().optional(),
  enabled: z.boolean().optional(),
});

const CreateIntegrationSchema = z.object({
  templateId: z.string(),
  name: z.string().optional(),
  settings: z.record(z.any()).optional(),
  credentials: z.record(z.string()),
  webhookUrl: z.string().url().optional(),
});

const UpdateIntegrationSchema = z.object({
  integrationId: z.string(),
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
  credentials: z.record(z.string()).optional(),
  webhookUrl: z.string().url().optional(),
});

const TestIntegrationSchema = z.object({
  templateId: z.string(),
  credentials: z.record(z.string()),
});

const MakeRequestSchema = z.object({
  integrationId: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  endpoint: z.string(),
  data: z.any().optional(),
  headers: z.record(z.string()).optional(),
  params: z.record(z.any()).optional(),
});

const ProcessWebhookSchema = z.object({
  integrationId: z.string(),
  payload: z.any(),
  headers: z.record(z.string()),
  signature: z.string().optional(),
});

export const integrationsRouter = router({
  // List available integration templates
  getTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view integration templates
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view integration templates",
        });
      }

      try {
        const templates = await integrationsService.listAvailableIntegrations();
        
        return {
          templates,
          total: templates.length,
          categories: [...new Set(templates.map(t => t.category))],
          providers: [...new Set(templates.map(t => t.provider))],
        };
      } catch (error) {
        console.error("Get templates error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch integration templates",
        });
      }
    }),

  // List tenant integrations
  list: protectedProcedure
    .input(ListIntegrationsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can list integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to list integrations",
        });
      }

      try {
        const integrations = await integrationsService.getIntegrations(ctx.tenant.id, {
          category: input.category,
          provider: input.provider,
          enabled: input.enabled,
        });

        return {
          integrations: integrations.map(integration => ({
            ...integration,
            // Remove sensitive credentials from response
            credentials: undefined,
            webhookSecret: undefined,
          })),
          total: integrations.length,
        };
      } catch (error) {
        console.error("List integrations error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list integrations",
        });
      }
    }),

  // Get specific integration
  get: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view integrations",
        });
      }

      try {
        const integration = await integrationsService.getIntegration(ctx.tenant.id, input.integrationId);
        
        if (!integration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Integration not found",
          });
        }

        return {
          ...integration,
          // Remove sensitive credentials from response
          credentials: undefined,
          webhookSecret: undefined,
        };
      } catch (error) {
        console.error("Get integration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get integration",
        });
      }
    }),

  // Create new integration
  create: protectedProcedure
    .input(CreateIntegrationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can create integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to create integrations",
        });
      }

      try {
        const integration = await integrationsService.createIntegration(ctx.tenant.id, {
          templateId: input.templateId,
          name: input.name,
          settings: input.settings,
          credentials: input.credentials,
          webhookUrl: input.webhookUrl,
        });

        return {
          success: true,
          integration: {
            ...integration,
            credentials: undefined,
            webhookSecret: undefined,
          },
          message: "Integration created successfully",
        };
      } catch (error) {
        console.error("Create integration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create integration: ${error.message}`,
        });
      }
    }),

  // Update integration
  update: protectedProcedure
    .input(UpdateIntegrationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can update integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to update integrations",
        });
      }

      try {
        const { integrationId, ...updates } = input;
        
        const integration = await integrationsService.updateIntegration(
          ctx.tenant.id,
          integrationId,
          updates
        );

        return {
          success: true,
          integration: {
            ...integration,
            credentials: undefined,
            webhookSecret: undefined,
          },
          message: "Integration updated successfully",
        };
      } catch (error) {
        console.error("Update integration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update integration: ${error.message}`,
        });
      }
    }),

  // Delete integration
  delete: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can delete integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to delete integrations",
        });
      }

      try {
        await integrationsService.deleteIntegration(ctx.tenant.id, input.integrationId);

        return {
          success: true,
          integrationId: input.integrationId,
          message: "Integration deleted successfully",
        };
      } catch (error) {
        console.error("Delete integration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete integration: ${error.message}`,
        });
      }
    }),

  // Test integration
  test: protectedProcedure
    .input(TestIntegrationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can test integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to test integrations",
        });
      }

      try {
        const result = await integrationsService.testIntegration(
          input.templateId,
          input.credentials
        );

        return {
          success: result.success,
          data: result.data,
          error: result.error,
          statusCode: result.statusCode,
          testedAt: new Date(),
        };
      } catch (error) {
        console.error("Test integration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to test integration: ${error.message}`,
        });
      }
    }),

  // Make API request through integration
  makeRequest: protectedProcedure
    .input(MakeRequestSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can make integration requests
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to make integration requests",
        });
      }

      try {
        const { integrationId, ...requestConfig } = input;
        
        const result = await integrationsService.makeRequest(
          ctx.tenant.id,
          integrationId,
          requestConfig
        );

        return {
          success: result.success,
          data: result.data,
          error: result.error,
          statusCode: result.statusCode,
          headers: result.headers,
          rateLimit: result.rateLimit,
          requestedAt: new Date(),
        };
      } catch (error) {
        console.error("Make request error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to make request: ${error.message}`,
        });
      }
    }),

  // Sync integration data
  sync: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can sync integrations
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to sync integrations",
        });
      }

      try {
        const result = await integrationsService.syncIntegration(
          ctx.tenant.id,
          input.integrationId
        );

        return {
          success: result.success,
          data: result.data,
          error: result.error,
          syncedAt: new Date(),
        };
      } catch (error) {
        console.error("Sync integration error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to sync integration: ${error.message}`,
        });
      }
    }),

  // Process incoming webhook
  processWebhook: protectedProcedure
    .input(ProcessWebhookSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      try {
        const result = await integrationsService.processWebhook(
          ctx.tenant.id,
          input.integrationId,
          input.payload,
          input.headers,
          input.signature
        );

        return {
          success: result.success,
          error: result.error,
          processedAt: new Date(),
        };
      } catch (error) {
        console.error("Process webhook error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to process webhook: ${error.message}`,
        });
      }
    }),

  // Get integration statistics
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view integration statistics
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view integration statistics",
        });
      }

      try {
        const integrations = await integrationsService.getIntegrations(ctx.tenant.id);
        
        const stats = {
          total: integrations.length,
          enabled: integrations.filter(i => i.enabled).length,
          disabled: integrations.filter(i => !i.enabled).length,
          byCategory: {} as Record<string, number>,
          byProvider: {} as Record<string, number>,
          lastSyncTimes: integrations
            .filter(i => i.lastSyncAt)
            .map(i => ({ id: i.id, name: i.name, lastSyncAt: i.lastSyncAt }))
            .sort((a, b) => (b.lastSyncAt?.getTime() || 0) - (a.lastSyncAt?.getTime() || 0))
            .slice(0, 10),
        };

        // Calculate category distribution
        for (const integration of integrations) {
          stats.byCategory[integration.category] = (stats.byCategory[integration.category] || 0) + 1;
        }

        // Calculate provider distribution
        for (const integration of integrations) {
          stats.byProvider[integration.provider] = (stats.byProvider[integration.provider] || 0) + 1;
        }

        return {
          ...stats,
          retrievedAt: new Date(),
        };
      } catch (error) {
        console.error("Get integration stats error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve integration statistics",
        });
      }
    }),
});