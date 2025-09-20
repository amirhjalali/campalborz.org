import { router, protectedProcedure, publicProcedure, adminProcedure } from '../lib/trpc';
import { donationsService } from '../services/donations';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const donationSchema = z.object({
  amount: z.number().min(100), // Minimum $1.00
  currency: z.string().default('USD'),
  type: z.enum(['ONE_TIME', 'RECURRING', 'CAMPAIGN']),
  campaign: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  recurring: z.object({
    interval: z.enum(['monthly', 'quarterly', 'yearly']),
    endDate: z.string().transform(str => new Date(str)).optional()
  }).optional(),
  donorInfo: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postal_code: z.string()
    }).optional()
  }).optional()
});

const donationFiltersSchema = z.object({
  status: z.array(z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])).optional(),
  type: z.array(z.enum(['ONE_TIME', 'RECURRING', 'CAMPAIGN'])).optional(),
  campaign: z.array(z.string()).optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  isAnonymous: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['amount', 'date', 'campaign']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  goal: z.number().min(100),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
  isActive: z.boolean().default(true),
  image: z.string().optional(),
  rewards: z.array(z.object({
    amount: z.number().min(100),
    title: z.string(),
    description: z.string(),
    maxQuantity: z.number().optional(),
    claimed: z.number().default(0)
  })).optional()
});

export const donationsRouter = router({
  // Public donation creation (for anonymous donations)
  createDonation: publicProcedure
    .input(donationSchema)
    .mutation(async ({ ctx, input }) => {
      return donationsService.createDonation(
        ctx.tenant.id,
        ctx.user?.id || null,
        input
      );
    }),

  // Protected donation creation (for logged in users)
  createUserDonation: protectedProcedure
    .input(donationSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.type === 'RECURRING' && !input.recurring) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Recurring donations require interval specification'
        });
      }

      if (input.type === 'RECURRING') {
        return donationsService.createRecurringDonation(
          ctx.tenant.id,
          ctx.user.id,
          { ...input, recurring: input.recurring! }
        );
      }

      return donationsService.createDonation(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  // Process webhook from Stripe
  processPaymentWebhook: publicProcedure
    .input(z.object({
      paymentIntentId: z.string()
    }))
    .mutation(async ({ input }) => {
      return donationsService.processSuccessfulPayment(input.paymentIntentId);
    }),

  // Get user's donations
  getMyDonations: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
      status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional()
    }))
    .query(async ({ ctx, input }) => {
      return prisma.donation.findMany({
        where: {
          userId: ctx.user.id,
          tenantId: ctx.tenant.id,
          ...(input.status && { status: input.status })
        },
        include: {
          payments: {
            select: { status: true, stripePaymentId: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit
      });
    }),

  // Get user's subscriptions
  getMySubscriptions: protectedProcedure
    .query(async ({ ctx }) => {
      return prisma.subscription.findMany({
        where: {
          userId: ctx.user.id,
          tenantId: ctx.tenant.id,
          plan: { startsWith: 'donation_' }
        },
        orderBy: { createdAt: 'desc' }
      });
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({
      subscriptionId: z.string(),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: input.subscriptionId,
          userId: ctx.user.id,
          tenantId: ctx.tenant.id
        }
      });

      if (!subscription) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Subscription not found'
        });
      }

      // Cancel in Stripe
      if (subscription.stripeSubscriptionId) {
        const stripe = new (require('stripe'))(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true
        });
      }

      // Update local record
      return prisma.subscription.update({
        where: { id: input.subscriptionId },
        data: {
          status: 'CANCELED',
          cancelledAt: new Date(),
          cancelReason: input.reason
        }
      });
    }),

  // Admin: Get all donations with filters
  getDonations: adminProcedure
    .input(donationFiltersSchema)
    .query(async ({ ctx, input }) => {
      return donationsService.getDonations(ctx.tenant.id, input);
    }),

  // Admin: Get donation analytics
  getAnalytics: adminProcedure
    .input(z.object({
      period: z.enum(['week', 'month', 'quarter', 'year']).default('month')
    }))
    .query(async ({ ctx, input }) => {
      return donationsService.getDonationAnalytics(ctx.tenant.id, input.period);
    }),

  // Campaign Management
  createCampaign: adminProcedure
    .input(campaignSchema)
    .mutation(async ({ ctx, input }) => {
      return donationsService.createCampaign(
        ctx.tenant.id,
        ctx.user.id,
        input
      );
    }),

  getCampaigns: publicProcedure
    .input(z.object({
      isActive: z.boolean().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10)
    }))
    .query(async ({ ctx, input }) => {
      const where = {
        tenantId: ctx.tenant.id,
        contentTypeId: 'donation-campaign',
        status: 'PUBLISHED',
        ...(input.isActive !== undefined && {
          content: {
            path: ['isActive'],
            equals: input.isActive
          }
        })
      };

      const [campaigns, total] = await Promise.all([
        prisma.content.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit
        }),
        prisma.content.count({ where })
      ]);

      // Get progress for each campaign
      const campaignsWithProgress = await Promise.all(
        campaigns.map(async (campaign) => {
          const progress = await donationsService.getCampaignProgress(
            ctx.tenant.id,
            campaign.title
          );
          return {
            ...campaign,
            progress
          };
        })
      );

      return {
        campaigns: campaignsWithProgress,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          pages: Math.ceil(total / input.limit)
        }
      };
    }),

  getCampaignById: publicProcedure
    .input(z.object({
      campaignId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const campaign = await prisma.content.findFirst({
        where: {
          id: input.campaignId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'donation-campaign',
          status: 'PUBLISHED'
        }
      });

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found'
        });
      }

      const progress = await donationsService.getCampaignProgress(
        ctx.tenant.id,
        campaign.title
      );

      return {
        ...campaign,
        progress
      };
    }),

  updateCampaign: adminProcedure
    .input(z.object({
      campaignId: z.string(),
      updates: campaignSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await prisma.content.findFirst({
        where: {
          id: input.campaignId,
          tenantId: ctx.tenant.id,
          contentTypeId: 'donation-campaign'
        }
      });

      if (!campaign) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Campaign not found'
        });
      }

      return prisma.content.update({
        where: { id: input.campaignId },
        data: {
          title: input.updates.name || campaign.title,
          content: {
            ...campaign.content,
            ...input.updates
          },
          updatedBy: ctx.user.id
        }
      });
    }),

  // Tax Receipt Generation
  generateTaxReceipt: protectedProcedure
    .input(z.object({
      donationId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return donationsService.generateTaxReceipt(
        input.donationId,
        ctx.tenant.id
      );
    }),

  // Donation Statistics for Public Display
  getPublicStats: publicProcedure
    .query(async ({ ctx }) => {
      const [totalRaised, totalDonors, activeCampaigns] = await Promise.all([
        prisma.donation.aggregate({
          where: {
            tenantId: ctx.tenant.id,
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }),
        prisma.donation.count({
          where: {
            tenantId: ctx.tenant.id,
            status: 'COMPLETED',
            isAnonymous: false
          }
        }),
        prisma.content.count({
          where: {
            tenantId: ctx.tenant.id,
            contentTypeId: 'donation-campaign',
            status: 'PUBLISHED',
            content: {
              path: ['isActive'],
              equals: true
            }
          }
        })
      ]);

      return {
        totalRaised: totalRaised._sum.amount || 0,
        totalDonors,
        activeCampaigns
      };
    }),

  // Recent Donations for Public Display (respecting anonymity)
  getRecentDonations: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(5),
      campaign: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      return prisma.donation.findMany({
        where: {
          tenantId: ctx.tenant.id,
          status: 'COMPLETED',
          ...(input.campaign && { campaign: input.campaign })
        },
        include: {
          user: {
            select: { name: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      }).then(donations => 
        donations.map(donation => ({
          amount: donation.amount,
          currency: donation.currency,
          campaign: donation.campaign,
          createdAt: donation.createdAt,
          donorName: donation.isAnonymous ? 'Anonymous' : donation.user?.name || 'Anonymous',
          donorAvatar: donation.isAnonymous ? null : donation.user?.avatar
        }))
      );
    })
});