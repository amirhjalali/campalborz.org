import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { CreateTenantSchema } from "@camp-platform/shared";
import { generateSubdomain, isValidSubdomain, RESERVED_SUBDOMAINS } from "@camp-platform/shared";
import { TRPCError } from "@trpc/server";

export const tenantRouter = router({
  // Create a new tenant (public endpoint for registration)
  create: publicProcedure
    .input(CreateTenantSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, subdomain: requestedSubdomain, ...rest } = input;
      
      // Generate or validate subdomain
      let subdomain = requestedSubdomain || generateSubdomain(name);
      
      if (!isValidSubdomain(subdomain)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid subdomain format",
        });
      }
      
      if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subdomain is reserved",
        });
      }
      
      // Check if subdomain is already taken
      const existingTenant = await ctx.prisma.tenant.findUnique({
        where: { subdomain },
      });
      
      if (existingTenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subdomain is already taken",
        });
      }
      
      // Create tenant
      const tenant = await ctx.prisma.tenant.create({
        data: {
          name,
          subdomain,
          ...rest,
        },
      });
      
      return tenant;
    }),

  // Get current tenant info
  current: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tenant context",
        });
      }
      
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: ctx.tenant.id },
      });
      
      return tenant;
    }),

  // Update tenant settings
  updateSettings: protectedProcedure
    .input(z.object({
      settings: z.record(z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No tenant context",
        });
      }
      
      // Check if user has permission to update tenant settings
      if (!ctx.user.permissions.includes("tenant:settings")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update tenant settings",
        });
      }
      
      const tenant = await ctx.prisma.tenant.update({
        where: { id: ctx.tenant.id },
        data: {
          settings: input.settings,
        },
      });
      
      return tenant;
    }),

  // Check subdomain availability
  checkSubdomain: publicProcedure
    .input(z.object({
      subdomain: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const { subdomain } = input;
      
      if (!isValidSubdomain(subdomain)) {
        return { available: false, reason: "Invalid format" };
      }
      
      if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        return { available: false, reason: "Reserved subdomain" };
      }
      
      const existing = await ctx.prisma.tenant.findUnique({
        where: { subdomain },
      });
      
      return { 
        available: !existing, 
        reason: existing ? "Already taken" : undefined 
      };
    }),
});