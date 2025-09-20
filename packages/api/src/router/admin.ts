import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../trpc";
import { CreateTenantSchema, PLANS } from "@camp-platform/shared";
import { TRPCError } from "@trpc/server";
import { requireRole, requirePermission } from "../middleware/auth";
import { adminService } from "../services/admin";

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

  // Tenant Admin Dashboard Features
  getDashboard: adminProcedure
    .input(z.object({
      period: z.enum(['week', 'month', 'quarter', 'year']).default('month')
    }))
    .query(async ({ ctx, input }) => {
      return adminService.getDashboardStats(ctx.tenant.id, input.period);
    }),

  getSystemHealth: adminProcedure
    .query(async ({ ctx }) => {
      return adminService.getSystemHealth(ctx.tenant.id);
    }),

  // User Management
  manageUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      action: z.enum(['promote', 'demote', 'suspend', 'activate', 'delete']),
      newRole: z.enum(['MEMBER', 'LEAD', 'ADMIN', 'TENANT_ADMIN']).optional(),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return adminService.manageUser(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  bulkUserUpdate: adminProcedure
    .input(z.object({
      userIds: z.array(z.string()),
      updates: z.object({
        role: z.enum(['MEMBER', 'LEAD', 'ADMIN', 'TENANT_ADMIN']).optional(),
        status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      return adminService.bulkUserUpdate(
        ctx.tenant.id,
        ctx.user.id,
        input.userIds,
        input.updates
      );
    }),

  // Content Moderation
  moderateContent: adminProcedure
    .input(z.object({
      contentType: z.enum(['event', 'page', 'comment', 'media']),
      contentId: z.string(),
      action: z.enum(['approve', 'reject', 'flag', 'remove']),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return adminService.moderateContent(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  // Data Export
  exportData: adminProcedure
    .input(z.object({
      dataType: z.enum(['users', 'events', 'donations', 'all']),
      format: z.enum(['csv', 'json', 'xlsx']).default('csv')
    }))
    .mutation(async ({ ctx, input }) => {
      return adminService.exportData(
        ctx.tenant.id,
        input.dataType,
        input.format
      );
    }),

  // Tenant Administration
  getUsers: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      role: z.enum(['MEMBER', 'LEAD', 'ADMIN', 'TENANT_ADMIN']).optional(),
      status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      sortBy: z.enum(['name', 'email', 'role', 'status', 'createdAt']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc')
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        ...(input.role && { role: input.role }),
        ...(input.status && { status: input.status })
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            avatar: true,
            createdAt: true,
            lastLoginAt: true,
            profile: true,
            _count: {
              select: {
                eventRSVPs: true,
                donations: true,
                memberPoints: true
              }
            }
          },
          orderBy: { [input.sortBy]: input.sortOrder },
          skip: (input.page - 1) * input.limit,
          take: input.limit
        }),
        ctx.prisma.user.count({ where })
      ]);

      return {
        users,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit)
        }
      };
    }),

  getEvents: adminProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
      type: z.string().optional(),
      dateFrom: z.string().transform(str => new Date(str)).optional(),
      dateTo: z.string().transform(str => new Date(str)).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        ...(input.status && { status: input.status }),
        ...(input.type && { type: input.type }),
        ...(input.dateFrom || input.dateTo) && {
          startDate: {
            ...(input.dateFrom && { gte: input.dateFrom }),
            ...(input.dateTo && { lte: input.dateTo })
          }
        }
      };

      if (input.search) {
        where.OR = [
          { title: { contains: input.search, mode: 'insensitive' } },
          { description: { contains: input.search, mode: 'insensitive' } }
        ];
      }

      const [events, total] = await Promise.all([
        ctx.prisma.event.findMany({
          where,
          include: {
            createdBy: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { rsvps: true, waitlist: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit
        }),
        ctx.prisma.event.count({ where })
      ]);

      return {
        events,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit)
        }
      };
    }),

  getAuditLog: adminProcedure
    .input(z.object({
      userId: z.string().optional(),
      action: z.string().optional(),
      entityType: z.string().optional(),
      dateFrom: z.string().transform(str => new Date(str)).optional(),
      dateTo: z.string().transform(str => new Date(str)).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        tenantId: ctx.tenant.id,
        ...(input.userId && { userId: input.userId }),
        ...(input.action && { action: { contains: input.action } }),
        ...(input.entityType && { entityType: input.entityType }),
        ...(input.dateFrom || input.dateTo) && {
          createdAt: {
            ...(input.dateFrom && { gte: input.dateFrom }),
            ...(input.dateTo && { lte: input.dateTo })
          }
        }
      };

      const [logs, total] = await Promise.all([
        ctx.prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit
        }),
        ctx.prisma.auditLog.count({ where })
      ]);

      return {
        logs,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit)
        }
      };
    }),

  // Configuration Management
  getTenantSettings: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.tenant.findUnique({
        where: { id: ctx.tenant.id },
        select: {
          id: true,
          name: true,
          subdomain: true,
          customDomain: true,
          plan: true,
          status: true,
          settings: true,
          metadata: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }),

  updateTenantSettings: adminProcedure
    .input(z.object({
      name: z.string().optional(),
      customDomain: z.string().optional(),
      settings: z.record(z.any()).optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.tenant.update({
        where: { id: ctx.tenant.id },
        data: {
          ...input,
          updatedAt: new Date()
        }
      });
    }),

  // Feature Flags Management
  getFeatureFlags: adminProcedure
    .query(async ({ ctx }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: ctx.tenant.id },
        select: { settings: true, plan: true }
      });

      const plan = PLANS[tenant?.plan as keyof typeof PLANS];
      const settings = tenant?.settings as any || {};

      return {
        features: {
          events: plan?.features.events || false,
          donations: plan?.features.donations || false,
          membership: plan?.features.membership || false,
          analytics: plan?.features.analytics || false,
          customDomain: plan?.features.customDomain || false,
          api: plan?.features.api || false,
          ...settings.features
        },
        limits: {
          users: plan?.limits.users || 0,
          events: plan?.limits.events || 0,
          storage: plan?.limits.storage || 0,
          emailsPerMonth: plan?.limits.emailsPerMonth || 0,
          ...settings.limits
        }
      };
    }),

  updateFeatureFlags: adminProcedure
    .input(z.object({
      features: z.record(z.boolean()).optional(),
      limits: z.record(z.number()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const currentSettings = await ctx.prisma.tenant.findUnique({
        where: { id: ctx.tenant.id },
        select: { settings: true }
      });

      const settings = currentSettings?.settings as any || {};

      return ctx.prisma.tenant.update({
        where: { id: ctx.tenant.id },
        data: {
          settings: {
            ...settings,
            ...(input.features && { features: { ...settings.features, ...input.features } }),
            ...(input.limits && { limits: { ...settings.limits, ...input.limits } })
          }
        }
      });
    })
});