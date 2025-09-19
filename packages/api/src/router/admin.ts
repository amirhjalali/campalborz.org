import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { CreateTenantSchema, PLANS } from "@camp-platform/shared";
import { TRPCError } from "@trpc/server";
import { requireRole, requirePermission } from "../middleware/auth";

export const adminRouter = router({
  // Super admin only: List all tenants
  listTenants: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
      plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"]).optional(),
    }))
    .use(({ ctx, next }) => {
      requireRole("SUPER_ADMIN")(ctx);
      return next();
    })
    .query(async ({ input, ctx }) => {
      const where: any = {};
      
      if (input.status) where.status = input.status;
      if (input.plan) where.plan = input.plan;
      
      const [tenants, total] = await Promise.all([
        ctx.prisma.tenant.findMany({
          where,
          skip: input.offset,
          take: input.limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                users: true,
                organizations: true,
              },
            },
          },
        }),
        ctx.prisma.tenant.count({ where }),
      ]);
      
      return {
        tenants,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Super admin only: Create tenant
  createTenant: protectedProcedure
    .input(CreateTenantSchema.extend({
      adminEmail: z.string().email(),
      adminName: z.string(),
      adminPassword: z.string().min(8),
    }))
    .use(({ ctx, next }) => {
      requireRole("SUPER_ADMIN")(ctx);
      return next();
    })
    .mutation(async ({ input, ctx }) => {
      const { adminEmail, adminName, adminPassword, ...tenantData } = input;
      
      // Check if subdomain is available
      const existingTenant = await ctx.prisma.tenant.findUnique({
        where: { subdomain: tenantData.subdomain },
      });
      
      if (existingTenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subdomain already exists",
        });
      }
      
      // Create tenant
      const tenant = await ctx.prisma.tenant.create({
        data: tenantData,
      });
      
      // Create admin user for the tenant
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      const adminUser = await ctx.prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: adminEmail,
          name: adminName,
          role: "TENANT_ADMIN",
          status: "ACTIVE",
          permissions: ["tenant:*", "org:*", "member:*", "event:*"],
          passwordHash,
        },
      });
      
      return {
        tenant,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
        },
      };
    }),

  // Super admin only: Update tenant
  updateTenant: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: z.object({
        name: z.string().optional(),
        status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
        plan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"]).optional(),
        settings: z.record(z.any()).optional(),
      }),
    }))
    .use(({ ctx, next }) => {
      requireRole("SUPER_ADMIN")(ctx);
      return next();
    })
    .mutation(async ({ input, ctx }) => {
      const tenant = await ctx.prisma.tenant.update({
        where: { id: input.id },
        data: input.data,
      });
      
      return tenant;
    }),

  // Super admin only: Delete tenant
  deleteTenant: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .use(({ ctx, next }) => {
      requireRole("SUPER_ADMIN")(ctx);
      return next();
    })
    .mutation(async ({ input, ctx }) => {
      // Check if tenant exists
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              users: true,
              organizations: true,
            },
          },
        },
      });
      
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }
      
      // Soft delete by setting status to inactive
      await ctx.prisma.tenant.update({
        where: { id: input.id },
        data: { status: "INACTIVE" },
      });
      
      return { success: true };
    }),

  // Platform analytics
  getAnalytics: protectedProcedure
    .use(({ ctx, next }) => {
      requireRole("SUPER_ADMIN")(ctx);
      return next();
    })
    .query(async ({ ctx }) => {
      const [
        totalTenants,
        activeTenants,
        totalUsers,
        totalOrganizations,
        tenantsByPlan,
        recentTenants,
      ] = await Promise.all([
        ctx.prisma.tenant.count(),
        ctx.prisma.tenant.count({ where: { status: "ACTIVE" } }),
        ctx.prisma.user.count(),
        ctx.prisma.organization.count(),
        ctx.prisma.tenant.groupBy({
          by: ["plan"],
          _count: true,
        }),
        ctx.prisma.tenant.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            subdomain: true,
            plan: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);
      
      return {
        totalTenants,
        activeTenants,
        totalUsers,
        totalOrganizations,
        tenantsByPlan: tenantsByPlan.map(item => ({
          plan: item.plan,
          count: item._count,
        })),
        recentTenants,
      };
    }),

  // Billing and subscription management
  getTenantBilling: protectedProcedure
    .input(z.object({
      tenantId: z.string(),
    }))
    .use(({ ctx, next }) => {
      requireRole("SUPER_ADMIN")(ctx);
      return next();
    })
    .query(async ({ input, ctx }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: input.tenantId },
      });
      
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }
      
      const plan = PLANS[tenant.plan as keyof typeof PLANS];
      
      return {
        tenant,
        plan,
        // TODO: Integrate with Stripe for actual billing data
        billingInfo: {
          status: "active",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: plan.price,
        },
      };
    }),
});