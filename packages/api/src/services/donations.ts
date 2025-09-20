import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { DonationType, DonationStatus, PaymentStatus, Prisma } from '@prisma/client';
import { emailService } from './email';
import { notificationService } from './notifications';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

interface DonationData {
  amount: number;
  currency?: string;
  type: DonationType;
  campaign?: string;
  message?: string;
  isAnonymous?: boolean;
  recurring?: {
    interval: 'monthly' | 'quarterly' | 'yearly';
    endDate?: Date;
  };
  donorInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
  };
}

interface DonationFilters {
  status?: DonationStatus[];
  type?: DonationType[];
  campaign?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  isAnonymous?: boolean;
  page: number;
  limit: number;
  sortBy?: 'amount' | 'date' | 'campaign';
  sortOrder?: 'asc' | 'desc';
}

interface DonationCampaign {
  id: string;
  name: string;
  description: string;
  goal: number;
  raised: number;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  image?: string;
  rewards?: {
    amount: number;
    title: string;
    description: string;
    maxQuantity?: number;
    claimed: number;
  }[];
}

class DonationsService {
  // Create One-time Donation
  async createDonation(
    tenantId: string,
    userId: string | null,
    data: DonationData
  ) {
    try {
      // Create donation record
      const donation = await prisma.donation.create({
        data: {
          tenantId,
          userId,
          amount: data.amount,
          currency: data.currency || 'USD',
          type: data.type,
          campaign: data.campaign,
          message: data.message,
          isAnonymous: data.isAnonymous || false,
          status: DonationStatus.PENDING,
          metadata: {
            donorInfo: data.donorInfo,
            recurring: data.recurring
          }
        }
      });

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency || 'usd',
        metadata: {
          donationId: donation.id,
          tenantId,
          campaign: data.campaign || 'general'
        }
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          tenantId,
          userId: userId || 'anonymous',
          amount: data.amount,
          currency: data.currency || 'USD',
          type: 'DONATION',
          status: PaymentStatus.PENDING,
          stripePaymentId: paymentIntent.id,
          donationId: donation.id,
          description: `Donation${data.campaign ? ` to ${data.campaign}` : ''}`,
          metadata: data.donorInfo
        }
      });

      logger.info('Donation created', {
        donationId: donation.id,
        amount: data.amount,
        campaign: data.campaign
      });

      return {
        donation,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret
        }
      };
    } catch (error) {
      logger.error('Failed to create donation', { error, tenantId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create donation'
      });
    }
  }

  // Create Recurring Donation
  async createRecurringDonation(
    tenantId: string,
    userId: string,
    data: DonationData & { recurring: NonNullable<DonationData['recurring']> }
  ) {
    try {
      // Get or create Stripe customer
      let stripeCustomerId: string;
      const user = await prisma.user.findFirst({ where: { id: userId } });
      
      if (user?.stripeCustomerId) {
        stripeCustomerId = user.stripeCustomerId;
      } else {
        const customer = await stripe.customers.create({
          email: user?.email || data.donorInfo?.email,
          name: user?.name || data.donorInfo?.name,
          metadata: { userId, tenantId }
        });
        
        stripeCustomerId = customer.id;
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId }
        });
      }

      // Create Stripe subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: data.currency || 'usd',
            product_data: {
              name: `Recurring Donation${data.campaign ? ` - ${data.campaign}` : ''}`,
            },
            unit_amount: data.amount,
            recurring: {
              interval: data.recurring.interval === 'quarterly' ? 'month' : data.recurring.interval,
              interval_count: data.recurring.interval === 'quarterly' ? 3 : 1
            }
          }
        }],
        metadata: {
          tenantId,
          userId,
          campaign: data.campaign || 'general',
          type: 'recurring_donation'
        }
      });

      // Create subscription record
      const subscriptionRecord = await prisma.subscription.create({
        data: {
          tenantId,
          userId,
          plan: `donation_${data.recurring.interval}`,
          amount: data.amount,
          currency: data.currency || 'USD',
          interval: data.recurring.interval.toUpperCase() as any,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          metadata: {
            campaign: data.campaign,
            message: data.message,
            isAnonymous: data.isAnonymous
          }
        }
      });

      // Create initial donation record
      const donation = await prisma.donation.create({
        data: {
          tenantId,
          userId,
          amount: data.amount,
          currency: data.currency || 'USD',
          type: DonationType.RECURRING,
          campaign: data.campaign,
          message: data.message,
          isAnonymous: data.isAnonymous || false,
          status: DonationStatus.PENDING,
          metadata: {
            subscriptionId: subscriptionRecord.id,
            stripeSubscriptionId: subscription.id
          }
        }
      });

      logger.info('Recurring donation created', {
        donationId: donation.id,
        subscriptionId: subscriptionRecord.id,
        amount: data.amount,
        interval: data.recurring.interval
      });

      return {
        donation,
        subscription: subscriptionRecord,
        stripeSubscription: subscription
      };
    } catch (error) {
      logger.error('Failed to create recurring donation', { error, tenantId, userId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create recurring donation'
      });
    }
  }

  // Process Successful Payment
  async processSuccessfulPayment(paymentIntentId: string) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntentId },
        include: { donation: true, user: true }
      });

      if (!payment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found'
        });
      }

      // Update payment and donation status
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.COMPLETED }
        });

        if (payment.donationId) {
          await tx.donation.update({
            where: { id: payment.donationId },
            data: { status: DonationStatus.COMPLETED }
          });
        }
      });

      // Send thank you email
      if (payment.user && !payment.donation?.isAnonymous) {
        await this.sendDonationThankYou(payment.donation!, payment.user);
      }

      // Award points to member if applicable
      if (payment.userId && payment.userId !== 'anonymous') {
        const pointsAwarded = Math.floor(payment.amount / 100); // 1 point per dollar
        await prisma.memberPoints.create({
          data: {
            userId: payment.userId,
            tenantId: payment.tenantId,
            points: pointsAwarded,
            reason: `Donation${payment.donation?.campaign ? ` to ${payment.donation.campaign}` : ''}`,
            category: 'donation',
            awardedAt: new Date()
          }
        }).catch(() => {}); // Ignore errors if member points system not available
      }

      // Update campaign progress
      if (payment.donation?.campaign) {
        await this.updateCampaignProgress(payment.tenantId, payment.donation.campaign);
      }

      logger.info('Payment processed successfully', {
        paymentId: payment.id,
        donationId: payment.donationId,
        amount: payment.amount
      });

      return payment;
    } catch (error) {
      logger.error('Failed to process successful payment', { error, paymentIntentId });
      throw error;
    }
  }

  // Get Donations with Filters
  async getDonations(tenantId: string, filters: DonationFilters) {
    try {
      const where: Prisma.DonationWhereInput = {
        tenantId,
        ...(filters.status?.length && { status: { in: filters.status } }),
        ...(filters.type?.length && { type: { in: filters.type } }),
        ...(filters.campaign?.length && { campaign: { in: filters.campaign } }),
        ...(filters.dateFrom || filters.dateTo) && {
          createdAt: {
            ...(filters.dateFrom && { gte: filters.dateFrom }),
            ...(filters.dateTo && { lte: filters.dateTo })
          }
        },
        ...(filters.amountMin || filters.amountMax) && {
          amount: {
            ...(filters.amountMin && { gte: filters.amountMin }),
            ...(filters.amountMax && { lte: filters.amountMax })
          }
        },
        ...(filters.isAnonymous !== undefined && { isAnonymous: filters.isAnonymous })
      };

      const orderBy: Prisma.DonationOrderByWithRelationInput = 
        filters.sortBy === 'amount' ? { amount: filters.sortOrder || 'desc' } :
        filters.sortBy === 'campaign' ? { campaign: filters.sortOrder || 'asc' } :
        { createdAt: filters.sortOrder || 'desc' };

      const [donations, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            },
            payments: {
              select: { status: true, stripePaymentId: true }
            }
          },
          orderBy,
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.donation.count({ where })
      ]);

      return {
        donations,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get donations', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get donations'
      });
    }
  }

  // Get Donation Analytics
  async getDonationAnalytics(tenantId: string, period: 'week' | 'month' | 'quarter' | 'year') {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const [
        totalStats,
        periodStats,
        campaignStats,
        topDonors,
        recentDonations,
        recurringStats
      ] = await Promise.all([
        // Total all-time stats
        prisma.donation.aggregate({
          where: { tenantId, status: DonationStatus.COMPLETED },
          _sum: { amount: true },
          _count: true,
          _avg: { amount: true }
        }),
        // Period stats
        prisma.donation.aggregate({
          where: {
            tenantId,
            status: DonationStatus.COMPLETED,
            createdAt: { gte: startDate }
          },
          _sum: { amount: true },
          _count: true
        }),
        // Campaign breakdown
        prisma.donation.groupBy({
          by: ['campaign'],
          where: {
            tenantId,
            status: DonationStatus.COMPLETED,
            campaign: { not: null }
          },
          _sum: { amount: true },
          _count: true,
          orderBy: { _sum: { amount: 'desc' } },
          take: 10
        }),
        // Top donors (non-anonymous)
        prisma.donation.groupBy({
          by: ['userId'],
          where: {
            tenantId,
            status: DonationStatus.COMPLETED,
            isAnonymous: false,
            userId: { not: null }
          },
          _sum: { amount: true },
          _count: true,
          orderBy: { _sum: { amount: 'desc' } },
          take: 10
        }).then(async (results) => {
          const userIds = results.map(r => r.userId).filter(Boolean);
          const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, avatar: true }
          });
          
          return results.map(result => ({
            user: users.find(u => u.id === result.userId),
            totalAmount: result._sum.amount || 0,
            donationCount: result._count
          }));
        }),
        // Recent donations
        prisma.donation.findMany({
          where: { tenantId, status: DonationStatus.COMPLETED },
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        // Recurring donation stats
        prisma.subscription.aggregate({
          where: {
            tenantId,
            status: 'ACTIVE',
            plan: { startsWith: 'donation_' }
          },
          _sum: { amount: true },
          _count: true
        })
      ]);

      return {
        totals: {
          allTime: {
            amount: totalStats._sum.amount || 0,
            count: totalStats._count,
            average: totalStats._avg.amount || 0
          },
          period: {
            amount: periodStats._sum.amount || 0,
            count: periodStats._count
          },
          recurring: {
            monthlyValue: recurringStats._sum.amount || 0,
            subscriptions: recurringStats._count
          }
        },
        campaigns: campaignStats.map(stat => ({
          campaign: stat.campaign,
          amount: stat._sum.amount || 0,
          count: stat._count
        })),
        topDonors,
        recentDonations
      };
    } catch (error) {
      logger.error('Failed to get donation analytics', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get analytics'
      });
    }
  }

  // Campaign Management
  async createCampaign(tenantId: string, userId: string, campaign: Omit<DonationCampaign, 'id' | 'raised'>) {
    try {
      // Store campaign in content management system
      const campaignContent = await prisma.content.create({
        data: {
          tenantId,
          contentTypeId: 'donation-campaign', // Assumes campaign content type exists
          title: campaign.name,
          slug: campaign.name.toLowerCase().replace(/\s+/g, '-'),
          content: {
            description: campaign.description,
            goal: campaign.goal,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            image: campaign.image,
            rewards: campaign.rewards
          },
          status: 'PUBLISHED',
          createdBy: userId,
          updatedBy: userId
        }
      });

      logger.info('Donation campaign created', {
        campaignId: campaignContent.id,
        name: campaign.name,
        goal: campaign.goal
      });

      return campaignContent;
    } catch (error) {
      logger.error('Failed to create campaign', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create campaign'
      });
    }
  }

  async getCampaignProgress(tenantId: string, campaignName: string) {
    try {
      const [raised, donorCount, recentDonations] = await Promise.all([
        prisma.donation.aggregate({
          where: {
            tenantId,
            campaign: campaignName,
            status: DonationStatus.COMPLETED
          },
          _sum: { amount: true }
        }),
        prisma.donation.count({
          where: {
            tenantId,
            campaign: campaignName,
            status: DonationStatus.COMPLETED,
            isAnonymous: false
          }
        }),
        prisma.donation.findMany({
          where: {
            tenantId,
            campaign: campaignName,
            status: DonationStatus.COMPLETED
          },
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ]);

      return {
        raised: raised._sum.amount || 0,
        donorCount,
        recentDonations
      };
    } catch (error) {
      logger.error('Failed to get campaign progress', { error, tenantId, campaignName });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get campaign progress'
      });
    }
  }

  // Tax Receipt Generation
  async generateTaxReceipt(donationId: string, tenantId: string) {
    try {
      const donation = await prisma.donation.findFirst({
        where: { id: donationId, tenantId },
        include: {
          user: true,
          tenant: true
        }
      });

      if (!donation) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Donation not found'
        });
      }

      if (donation.status !== DonationStatus.COMPLETED) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot generate receipt for incomplete donation'
        });
      }

      // Generate PDF receipt (implementation depends on PDF library)
      const receiptData = {
        receiptNumber: `${donation.tenant.slug.toUpperCase()}-${donation.id.slice(-8)}`,
        donorName: donation.user?.name || 'Anonymous Donor',
        donorEmail: donation.user?.email,
        amount: donation.amount,
        currency: donation.currency,
        date: donation.createdAt,
        campaign: donation.campaign,
        organizationName: donation.tenant.name,
        taxId: donation.tenant.metadata?.taxId || 'Not Available'
      };

      // Update donation to mark receipt as sent
      await prisma.donation.update({
        where: { id: donationId },
        data: { taxReceiptSent: true }
      });

      logger.info('Tax receipt generated', { donationId, receiptNumber: receiptData.receiptNumber });

      return receiptData;
    } catch (error) {
      logger.error('Failed to generate tax receipt', { error, donationId });
      throw error;
    }
  }

  // Private Helper Methods
  private async sendDonationThankYou(donation: any, user: any) {
    try {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Thank you for your donation!',
        template: 'donation-thank-you',
        data: {
          donorName: user.name,
          amount: donation.amount,
          currency: donation.currency,
          campaign: donation.campaign,
          message: donation.message,
          isRecurring: donation.type === DonationType.RECURRING
        }
      });
    } catch (error) {
      logger.error('Failed to send donation thank you email', { error, donationId: donation.id });
    }
  }

  private async updateCampaignProgress(tenantId: string, campaignName: string) {
    try {
      const progress = await this.getCampaignProgress(tenantId, campaignName);
      
      // Update campaign content with latest progress
      await prisma.content.updateMany({
        where: {
          tenantId,
          slug: campaignName.toLowerCase().replace(/\s+/g, '-'),
          contentTypeId: 'donation-campaign'
        },
        data: {
          content: {
            raised: progress.raised,
            donorCount: progress.donorCount,
            lastUpdated: new Date()
          }
        }
      });
    } catch (error) {
      logger.error('Failed to update campaign progress', { error, tenantId, campaignName });
    }
  }
}

export const donationsService = new DonationsService();