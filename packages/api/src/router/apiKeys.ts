import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// API Key schemas
const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1),
  rateLimit: z.number().min(100).max(10000).default(1000),
  expiresAt: z.date().optional(),
});

const UpdateApiKeySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  rateLimit: z.number().min(100).max(10000).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.date().optional(),
});

const DeleteApiKeySchema = z.object({
  id: z.string(),
});

export const apiKeysRouter = router({
  // List API keys
  list: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can manage API keys
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to manage API keys",
        });
      }

      try {
        const apiKeys = await ctx.prisma.apiKey.findMany({
          where: { tenantId: ctx.tenant.id },
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            rateLimit: true,
            isActive: true,
            lastUsedAt: true,
            usageCount: true,
            expiresAt: true,
            createdAt: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });

        return { apiKeys };
      } catch (error) {
        console.error("Failed to list API keys:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve API keys",
        });
      }
    }),

  // Create new API key
  create: protectedProcedure
    .input(CreateApiKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can create API keys
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to create API keys",
        });
      }

      try {
        // Generate a secure API key
        const apiKey = crypto.randomBytes(32).toString('hex');
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Create the API key record
        const createdKey = await ctx.prisma.apiKey.create({
          data: {
            tenantId: ctx.tenant.id,
            name: input.name,
            description: input.description,
            keyHash,
            permissions: input.permissions,
            rateLimit: input.rateLimit,
            expiresAt: input.expiresAt,
            createdBy: ctx.user.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            rateLimit: true,
            expiresAt: true,
            createdAt: true,
          },
        });

        // Return the API key only once, never store it plaintext
        return {
          ...createdKey,
          apiKey, // This is the only time the key is returned
          warning: "This API key will not be shown again. Please save it securely.",
        };
      } catch (error) {
        console.error("Failed to create API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API key",
        });
      }
    }),

  // Update API key
  update: protectedProcedure
    .input(UpdateApiKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can update API keys
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to update API keys",
        });
      }

      try {
        // Check if the API key exists and belongs to this tenant
        const existingKey = await ctx.prisma.apiKey.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.tenant.id,
          },
        });

        if (!existingKey) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "API key not found",
          });
        }

        // Update the API key
        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.permissions !== undefined) updateData.permissions = input.permissions;
        if (input.rateLimit !== undefined) updateData.rateLimit = input.rateLimit;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;

        const updatedKey = await ctx.prisma.apiKey.update({
          where: { id: input.id },
          data: updateData,
          select: {
            id: true,
            name: true,
            description: true,
            permissions: true,
            rateLimit: true,
            isActive: true,
            expiresAt: true,
            updatedAt: true,
          },
        });

        return updatedKey;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Failed to update API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update API key",
        });
      }
    }),

  // Delete API key
  delete: protectedProcedure
    .input(DeleteApiKeySchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can delete API keys
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to delete API keys",
        });
      }

      try {
        // Check if the API key exists and belongs to this tenant
        const existingKey = await ctx.prisma.apiKey.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.tenant.id,
          },
        });

        if (!existingKey) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "API key not found",
          });
        }

        // Delete the API key
        await ctx.prisma.apiKey.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Failed to delete API key:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete API key",
        });
      }
    }),

  // Get API key usage statistics
  getUsage: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view API key usage
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required to view API key usage",
        });
      }

      try {
        const apiKey = await ctx.prisma.apiKey.findFirst({
          where: {
            id: input.id,
            tenantId: ctx.tenant.id,
          },
          select: {
            id: true,
            name: true,
            usageCount: true,
            lastUsedAt: true,
            rateLimit: true,
            createdAt: true,
          },
        });

        if (!apiKey) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "API key not found",
          });
        }

        // Calculate usage statistics
        const now = new Date();
        const daysSinceCreated = Math.ceil((now.getTime() - apiKey.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const averageUsagePerDay = daysSinceCreated > 0 ? apiKey.usageCount / daysSinceCreated : 0;

        return {
          ...apiKey,
          statistics: {
            totalRequests: apiKey.usageCount,
            averagePerDay: Math.round(averageUsagePerDay * 100) / 100,
            daysSinceCreated,
            lastUsedAgo: apiKey.lastUsedAt 
              ? Math.floor((now.getTime() - apiKey.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24))
              : null,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Failed to get API key usage:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve API key usage",
        });
      }
    }),

  // Get available permissions for API keys
  getPermissions: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Only admins can view permissions
      if (!["admin", "tenant_admin", "super_admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      // Return available API permissions
      return {
        permissions: [
          {
            key: "*",
            name: "Full Access",
            description: "Complete access to all API endpoints",
            category: "admin",
          },
          {
            key: "events:read",
            name: "Read Events",
            description: "View events and attendees",
            category: "events",
          },
          {
            key: "events:write",
            name: "Write Events",
            description: "Create and update events",
            category: "events",
          },
          {
            key: "events:delete",
            name: "Delete Events",
            description: "Delete events",
            category: "events",
          },
          {
            key: "members:read",
            name: "Read Members",
            description: "View member information",
            category: "members",
          },
          {
            key: "members:write",
            name: "Write Members",
            description: "Create and update member profiles",
            category: "members",
          },
          {
            key: "donations:read",
            name: "Read Donations",
            description: "View donation information",
            category: "donations",
          },
          {
            key: "content:read",
            name: "Read Content",
            description: "View pages and content",
            category: "content",
          },
          {
            key: "content:write",
            name: "Write Content",
            description: "Create and update pages",
            category: "content",
          },
          {
            key: "analytics:read",
            name: "Read Analytics",
            description: "View analytics and reports",
            category: "analytics",
          },
        ],
        categories: [
          { key: "admin", name: "Administration" },
          { key: "events", name: "Events Management" },
          { key: "members", name: "Member Management" },
          { key: "donations", name: "Donations" },
          { key: "content", name: "Content Management" },
          { key: "analytics", name: "Analytics" },
        ],
      };
    }),
});