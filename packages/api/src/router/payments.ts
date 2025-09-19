import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
// import Stripe from "stripe";

// Initialize Stripe (in production, use environment variable)
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2023-10-16",
// });

// Payment schemas
const CreatePaymentIntentSchema = z.object({
  amount: z.number().int().positive(), // in cents
  currency: z.string().default("USD"),
  type: z.enum(["DONATION", "EVENT_TICKET", "SUBSCRIPTION", "MERCHANDISE", "OTHER"]),
  description: z.string().optional(),
  eventId: z.string().optional(),
  donationCampaign: z.string().optional(),
  metadata: z.any().optional(),
});

const ProcessPaymentSchema = z.object({
  paymentIntentId: z.string(),
  paymentMethodId: z.string(),
  savePaymentMethod: z.boolean().default(false),
});

const CreateDonationSchema = z.object({
  amount: z.number().int().positive(), // in cents
  currency: z.string().default("USD"),
  type: z.enum(["ONE_TIME", "RECURRING", "CAMPAIGN"]).default("ONE_TIME"),
  campaign: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  metadata: z.any().optional(),
});

const CreateSubscriptionSchema = z.object({
  plan: z.string(),
  paymentMethodId: z.string(),
  couponCode: z.string().optional(),
  metadata: z.any().optional(),
});

const RefundPaymentSchema = z.object({
  paymentId: z.string(),
  amount: z.number().int().positive().optional(), // partial refund amount in cents
  reason: z.string().optional(),
});

export const paymentsRouter = router({
  // Create payment intent for Stripe
  createPaymentIntent: protectedProcedure
    .input(CreatePaymentIntentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        // In production, create Stripe payment intent
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount: input.amount,
        //   currency: input.currency,
        //   metadata: {
        //     tenantId: ctx.tenant.id,
        //     userId: ctx.user.id,
        //     type: input.type,
        //     ...input.metadata,
        //   },
        // });

        // Mock payment intent for development
        const mockPaymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substr(2, 9)}`;

        // Create payment record in database
        const payment = await ctx.prisma.payment.create({
          data: {
            tenantId: ctx.tenant.id,
            userId: ctx.user.id,
            amount: input.amount,
            currency: input.currency,
            type: input.type,
            status: "PENDING",
            stripePaymentId: mockPaymentIntentId,
            description: input.description,
            eventId: input.eventId,
            metadata: input.metadata,
          },
        });

        return {
          paymentId: payment.id,
          clientSecret: mockClientSecret,
          amount: input.amount,
          currency: input.currency,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment intent",
        });
      }
    }),

  // Process payment after client-side confirmation
  processPayment: protectedProcedure
    .input(ProcessPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        // In production, confirm with Stripe
        // const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

        // Update payment status in database
        const payment = await ctx.prisma.payment.findFirst({
          where: {
            stripePaymentId: input.paymentIntentId,
            tenantId: ctx.tenant.id,
            userId: ctx.user.id,
          },
        });

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Payment not found",
          });
        }

        const updatedPayment = await ctx.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCEEDED",
            // stripeCustomerId: paymentIntent.customer as string,
          },
        });

        // If this is an event payment, confirm the RSVP
        if (payment.eventId) {
          await ctx.prisma.eventRSVP.updateMany({
            where: {
              eventId: payment.eventId,
              userId: ctx.user.id,
            },
            data: {
              status: "CONFIRMED",
            },
          });
        }

        return {
          success: true,
          paymentId: updatedPayment.id,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process payment",
        });
      }
    }),

  // Create donation
  createDonation: publicProcedure
    .input(CreateDonationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      try {
        const donation = await ctx.prisma.donation.create({
          data: {
            tenantId: ctx.tenant.id,
            userId: ctx.user?.id || null,
            amount: input.amount,
            currency: input.currency,
            type: input.type,
            status: "PENDING",
            campaign: input.campaign,
            message: input.message,
            isAnonymous: input.isAnonymous || !ctx.user,
            metadata: input.metadata,
          },
        });

        // In production, create Stripe payment for donation
        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount: input.amount,
        //   currency: input.currency,
        //   metadata: {
        //     tenantId: ctx.tenant.id,
        //     donationId: donation.id,
        //     type: "DONATION",
        //   },
        // });

        // Mock payment intent for development
        const mockPaymentIntentId = `pi_donation_${Date.now()}`;
        const mockClientSecret = `${mockPaymentIntentId}_secret`;

        // Create payment record
        if (ctx.user) {
          await ctx.prisma.payment.create({
            data: {
              tenantId: ctx.tenant.id,
              userId: ctx.user.id,
              amount: input.amount,
              currency: input.currency,
              type: "DONATION",
              status: "PENDING",
              stripePaymentId: mockPaymentIntentId,
              donationId: donation.id,
              description: `Donation${input.campaign ? ` to ${input.campaign}` : ""}`,
            },
          });
        }

        return {
          donationId: donation.id,
          clientSecret: mockClientSecret,
          amount: input.amount,
          currency: input.currency,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create donation",
        });
      }
    }),

  // Create subscription
  createSubscription: protectedProcedure
    .input(CreateSubscriptionSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        // Get plan details (would come from configuration)
        const plans = {
          monthly: { amount: 2900, interval: "MONTHLY" as const },
          quarterly: { amount: 7500, interval: "QUARTERLY" as const },
          yearly: { amount: 25000, interval: "YEARLY" as const },
        };

        const planDetails = plans[input.plan as keyof typeof plans];
        if (!planDetails) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid plan selected",
          });
        }

        // In production, create Stripe subscription
        // const subscription = await stripe.subscriptions.create({
        //   customer: stripeCustomerId,
        //   items: [{ price: stripePriceId }],
        //   payment_behavior: "default_incomplete",
        //   expand: ["latest_invoice.payment_intent"],
        // });

        // Mock subscription for development
        const mockSubscriptionId = `sub_${Date.now()}`;
        const now = new Date();
        const periodEnd = new Date();
        
        if (planDetails.interval === "MONTHLY") {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else if (planDetails.interval === "QUARTERLY") {
          periodEnd.setMonth(periodEnd.getMonth() + 3);
        } else {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        const subscription = await ctx.prisma.subscription.create({
          data: {
            tenantId: ctx.tenant.id,
            userId: ctx.user.id,
            plan: input.plan,
            amount: planDetails.amount,
            currency: "USD",
            interval: planDetails.interval,
            status: "ACTIVE",
            stripeSubscriptionId: mockSubscriptionId,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            metadata: input.metadata,
          },
        });

        return {
          subscriptionId: subscription.id,
          plan: input.plan,
          amount: planDetails.amount,
          interval: planDetails.interval,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subscription",
        });
      }
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({
      subscriptionId: z.string(),
      reason: z.string().optional(),
      immediate: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const subscription = await ctx.prisma.subscription.findFirst({
        where: {
          id: input.subscriptionId,
          tenantId: ctx.tenant.id,
          userId: ctx.user.id,
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      // In production, cancel Stripe subscription
      // await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      //   cancel_at_period_end: !input.immediate,
      // });

      const updatedSubscription = await ctx.prisma.subscription.update({
        where: { id: input.subscriptionId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancelReason: input.reason,
        },
      });

      return {
        success: true,
        subscription: updatedSubscription,
      };
    }),

  // Refund payment
  refund: protectedProcedure
    .input(RefundPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions to process refunds",
        });
      }

      const payment = await ctx.prisma.payment.findFirst({
        where: {
          id: input.paymentId,
          tenantId: ctx.tenant.id,
        },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      if (payment.status !== "SUCCEEDED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only successful payments can be refunded",
        });
      }

      const refundAmount = input.amount || payment.amount;
      if (refundAmount > payment.amount - (payment.refundedAmount || 0)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Refund amount exceeds available balance",
        });
      }

      // In production, process Stripe refund
      // const refund = await stripe.refunds.create({
      //   payment_intent: payment.stripePaymentId,
      //   amount: refundAmount,
      //   reason: input.reason,
      // });

      const isPartialRefund = refundAmount < payment.amount;
      const updatedPayment = await ctx.prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          status: isPartialRefund ? "PARTIALLY_REFUNDED" : "REFUNDED",
          refundedAmount: (payment.refundedAmount || 0) + refundAmount,
        },
      });

      // If this was a donation, update donation status
      if (payment.donationId) {
        await ctx.prisma.donation.update({
          where: { id: payment.donationId },
          data: { status: "REFUNDED" },
        });
      }

      return {
        success: true,
        refundedAmount: refundAmount,
        payment: updatedPayment,
      };
    }),

  // Get payment history
  getPaymentHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      type: z.enum(["DONATION", "EVENT_TICKET", "SUBSCRIPTION", "MERCHANDISE", "OTHER"]).optional(),
      status: z.enum(["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELLED"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      const where: any = {
        tenantId: ctx.tenant.id,
        userId: ctx.user.id,
      };

      if (input.type) {
        where.type = input.type;
      }
      if (input.status) {
        where.status = input.status;
      }

      const [payments, total] = await Promise.all([
        ctx.prisma.payment.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: 'desc' },
          include: {
            event: {
              select: {
                id: true,
                title: true,
              },
            },
            donation: {
              select: {
                id: true,
                campaign: true,
              },
            },
          },
        }),
        ctx.prisma.payment.count({ where }),
      ]);

      return {
        payments,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  // Get donation statistics
  getDonationStats: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tenant context required",
        });
      }

      const [
        totalRaised,
        totalDonations,
        averageDonation,
        recentDonations,
        campaignTotals,
      ] = await Promise.all([
        ctx.prisma.donation.aggregate({
          where: {
            tenantId: ctx.tenant.id,
            status: "COMPLETED",
          },
          _sum: { amount: true },
        }),
        ctx.prisma.donation.count({
          where: {
            tenantId: ctx.tenant.id,
            status: "COMPLETED",
          },
        }),
        ctx.prisma.donation.aggregate({
          where: {
            tenantId: ctx.tenant.id,
            status: "COMPLETED",
          },
          _avg: { amount: true },
        }),
        ctx.prisma.donation.findMany({
          where: {
            tenantId: ctx.tenant.id,
            status: "COMPLETED",
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            isAnonymous: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        }),
        ctx.prisma.donation.groupBy({
          by: ['campaign'],
          where: {
            tenantId: ctx.tenant.id,
            status: "COMPLETED",
            campaign: { not: null },
          },
          _sum: { amount: true },
          _count: true,
        }),
      ]);

      return {
        totalRaised: totalRaised._sum.amount || 0,
        totalDonations,
        averageDonation: Math.round(averageDonation._avg.amount || 0),
        recentDonations: recentDonations.map(d => ({
          id: d.id,
          amount: d.amount,
          donor: d.isAnonymous ? "Anonymous" : d.user?.name || "Anonymous",
          date: d.createdAt,
        })),
        campaignTotals: campaignTotals.map(c => ({
          campaign: c.campaign!,
          total: c._sum.amount || 0,
          count: c._count,
        })),
      };
    }),
});