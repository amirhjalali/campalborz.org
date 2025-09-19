import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { PLANS } from "@camp-platform/shared";
import { TRPCError } from "@trpc/server";
import { requirePermission } from "../middleware/auth";

export const billingRouter = router({
  // Get current subscription
  getSubscription: protectedProcedure
    .use(({ ctx, next }) => {
      requirePermission("tenant:billing")(ctx);
      return next();
    })
    .query(async ({ ctx }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: ctx.user.tenantId },
      });
      
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }
      
      const plan = PLANS[tenant.plan as keyof typeof PLANS];
      
      return {
        plan: tenant.plan,
        status: tenant.status,
        features: plan.features,
        limits: {
          maxMembers: plan.maxMembers,
          maxEvents: plan.maxEvents,
          maxStorage: plan.maxStorage,
        },
        price: plan.price,
        // TODO: Add Stripe subscription data
      };
    }),

  // Upgrade/downgrade plan
  changePlan: protectedProcedure
    .input(z.object({
      newPlan: z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE", "CUSTOM"]),
    }))
    .use(({ ctx, next }) => {
      requirePermission("tenant:billing")(ctx);
      return next();
    })
    .mutation(async ({ input, ctx }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: ctx.user.tenantId },
      });
      
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tenant not found",
        });
      }
      
      const newPlan = PLANS[input.newPlan];
      const currentPlan = PLANS[tenant.plan as keyof typeof PLANS];
      
      // Update tenant plan and features
      const updatedTenant = await ctx.prisma.tenant.update({
        where: { id: ctx.user.tenantId },
        data: {
          plan: input.newPlan,
          settings: {
            ...tenant.settings,
            features: {
              memberManagement: newPlan.features.includes("memberManagement"),
              eventManagement: newPlan.features.includes("eventManagement"),
              taskManagement: newPlan.features.includes("taskManagement"),
              resourceManagement: newPlan.features.includes("resourceManagement"),
              paymentProcessing: newPlan.features.includes("paymentProcessing"),
              customBranding: newPlan.features.includes("customBranding"),
              apiAccess: newPlan.features.includes("apiAccess"),
            },
            limits: {
              maxMembers: newPlan.maxMembers,
              maxEvents: newPlan.maxEvents,
              maxStorage: newPlan.maxStorage,
            },
          },
        },
      });
      
      // TODO: Handle Stripe subscription update
      
      return {
        success: true,
        newPlan: input.newPlan,
        previousPlan: tenant.plan,
      };
    }),

  // Get usage statistics
  getUsage: protectedProcedure
    .use(({ ctx, next }) => {
      requirePermission("tenant:billing")(ctx);
      return next();
    })
    .query(async ({ ctx }) => {
      const [userCount, orgCount] = await Promise.all([
        ctx.prisma.user.count({
          where: { tenantId: ctx.user.tenantId },
        }),
        ctx.prisma.organization.count({
          where: { tenantId: ctx.user.tenantId },
        }),
      ]);
      
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: ctx.user.tenantId },
      });
      
      const plan = PLANS[tenant?.plan as keyof typeof PLANS];
      
      return {
        usage: {
          members: userCount,
          organizations: orgCount,
          events: 0, // TODO: Add events count when events table is created
          storage: 0, // TODO: Calculate actual storage usage
        },
        limits: {
          maxMembers: plan.maxMembers,
          maxEvents: plan.maxEvents,
          maxStorage: plan.maxStorage,
        },
        percentages: {
          members: plan.maxMembers ? (userCount / plan.maxMembers) * 100 : 0,
          events: 0,
          storage: 0,
        },
      };
    }),

  // Get billing history
  getBillingHistory: protectedProcedure
    .use(({ ctx, next }) => {
      requirePermission("tenant:billing")(ctx);
      return next();
    })
    .query(async ({ ctx }) => {
      // TODO: Integrate with Stripe to get actual billing history
      return {
        invoices: [
          {
            id: "inv_1",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            amount: 99,
            status: "paid",
            plan: "PROFESSIONAL",
          },
          {
            id: "inv_2",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            amount: 99,
            status: "paid",
            plan: "PROFESSIONAL",
          },
        ],
      };
    }),
});