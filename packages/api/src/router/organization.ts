import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { CreateOrganizationSchema } from "@camp-platform/shared";
import { TRPCError } from "@trpc/server";

export const organizationRouter = router({
  // Create a new organization
  create: protectedProcedure
    .input(CreateOrganizationSchema)
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (!ctx.user.permissions.includes("org:create")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to create organizations",
        });
      }
      
      const organization = await ctx.prisma.organization.create({
        data: {
          ...input,
          tenantId: ctx.user.tenantId,
        },
      });
      
      return organization;
    }),

  // List organizations for current tenant
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      offset: z.number().min(0).default(0),
      type: z.enum(["CAMP", "FESTIVAL", "COLLECTIVE", "COMMUNITY", "OTHER"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const organizations = await ctx.prisma.organization.findMany({
        where: {
          tenantId: ctx.user.tenantId,
          ...(input.type && { type: input.type }),
        },
        skip: input.offset,
        take: input.limit,
        orderBy: { createdAt: "desc" },
      });
      
      const total = await ctx.prisma.organization.count({
        where: {
          tenantId: ctx.user.tenantId,
          ...(input.type && { type: input.type }),
        },
      });
      
      return {
        organizations,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get organization by ID
  get: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const organization = await ctx.prisma.organization.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });
      
      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }
      
      return organization;
    }),

  // Update organization
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: CreateOrganizationSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (!ctx.user.permissions.includes("org:update")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update organizations",
        });
      }
      
      // Verify organization exists and belongs to tenant
      const existing = await ctx.prisma.organization.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }
      
      const organization = await ctx.prisma.organization.update({
        where: { id: input.id },
        data: input.data,
      });
      
      return organization;
    }),

  // Delete organization
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Check permission
      if (!ctx.user.permissions.includes("org:delete")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to delete organizations",
        });
      }
      
      // Verify organization exists and belongs to tenant
      const existing = await ctx.prisma.organization.findFirst({
        where: {
          id: input.id,
          tenantId: ctx.user.tenantId,
        },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }
      
      await ctx.prisma.organization.delete({
        where: { id: input.id },
      });
      
      return { success: true };
    }),
});