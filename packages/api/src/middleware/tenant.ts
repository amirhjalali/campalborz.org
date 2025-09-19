import { TRPCError } from "@trpc/server";
import { Context } from "../context";
import { PLANS } from "@camp-platform/shared";

export function validateTenantFeature(feature: string) {
  return async (ctx: Context) => {
    if (!ctx.tenant) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required",
      });
    }

    // Get tenant from database with settings
    const tenant = await ctx.prisma.tenant.findUnique({
      where: { id: ctx.tenant.id },
    });

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }

    if (tenant.status !== "ACTIVE") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Tenant account is not active",
      });
    }

    // Check if tenant has access to the feature
    const settings = tenant.settings as any;
    const hasFeature = settings?.features?.[feature] === true;

    if (!hasFeature) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Feature '${feature}' is not available on your plan`,
      });
    }

    return tenant;
  };
}

export function validateTenantLimits(limitType: string, currentCount: number) {
  return async (ctx: Context) => {
    if (!ctx.tenant) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tenant context required",
      });
    }

    const tenant = await ctx.prisma.tenant.findUnique({
      where: { id: ctx.tenant.id },
    });

    if (!tenant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tenant not found",
      });
    }

    const settings = tenant.settings as any;
    const limits = settings?.limits || {};
    
    let limit: number | null = null;
    
    switch (limitType) {
      case "members":
        limit = limits.maxMembers;
        break;
      case "events":
        limit = limits.maxEvents;
        break;
      case "storage":
        limit = limits.maxStorage;
        break;
    }

    if (limit !== null && currentCount >= limit) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `${limitType} limit reached (${limit}). Upgrade your plan for more capacity.`,
      });
    }

    return tenant;
  };
}

export async function getTenantSettings(ctx: Context) {
  if (!ctx.tenant) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Tenant context required",
    });
  }

  const tenant = await ctx.prisma.tenant.findUnique({
    where: { id: ctx.tenant.id },
  });

  if (!tenant) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tenant not found",
    });
  }

  return tenant.settings as any;
}