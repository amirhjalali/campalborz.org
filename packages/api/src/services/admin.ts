import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import { TRPCError } from '@trpc/server';
import { UserRole, UserStatus, Prisma } from '@prisma/client';
import { notificationService } from './notifications';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalEvents: number;
    upcomingEvents: number;
    totalDonations: number;
    monthlyRevenue: number;
    pendingApplications: number;
    systemHealth: 'good' | 'warning' | 'critical';
  };
  userGrowth: {
    period: string;
    newUsers: number;
    activeUsers: number;
    retentionRate: number;
  }[];
  eventMetrics: {
    period: string;
    eventsCreated: number;
    totalAttendees: number;
    averageAttendance: number;
  }[];
  revenueMetrics: {
    period: string;
    donations: number;
    subscriptions: number;
    events: number;
    total: number;
  }[];
  topPerformers: {
    events: Array<{ id: string; title: string; attendees: number; revenue: number }>;
    campaigns: Array<{ name: string; raised: number; goal: number; donors: number }>;
    volunteers: Array<{ id: string; name: string; hours: number; contributions: number }>;
  };
}

interface SystemHealth {
  database: { status: 'healthy' | 'degraded' | 'down'; responseTime: number };
  email: { status: 'healthy' | 'degraded' | 'down'; lastSent: Date };
  payments: { status: 'healthy' | 'degraded' | 'down'; lastTransaction: Date };
  storage: { status: 'healthy' | 'degraded' | 'down'; usage: number };
  api: { status: 'healthy' | 'degraded' | 'down'; errorRate: number };
}

interface UserManagement {
  userId: string;
  action: 'promote' | 'demote' | 'suspend' | 'activate' | 'delete';
  newRole?: UserRole;
  reason?: string;
}

interface ContentModeration {
  contentType: 'event' | 'page' | 'comment' | 'media';
  contentId: string;
  action: 'approve' | 'reject' | 'flag' | 'remove';
  reason?: string;
}

class AdminService {
  // Dashboard Analytics
  async getDashboardStats(
    tenantId: string,
    period: 'week' | 'month' | 'quarter' | 'year' = 'month'
  ): Promise<DashboardStats> {
    try {
      const now = new Date();
      const periods = this.generatePeriods(period, 6);

      const [overview, userGrowth, eventMetrics, revenueMetrics, topPerformers] = await Promise.all([
        this.getOverviewStats(tenantId),
        this.getUserGrowthStats(tenantId, periods),
        this.getEventMetrics(tenantId, periods),
        this.getRevenueMetrics(tenantId, periods),
        this.getTopPerformers(tenantId)
      ]);

      return {
        overview,
        userGrowth,
        eventMetrics,
        revenueMetrics,
        topPerformers
      };
    } catch (error) {
      logger.error('Failed to get dashboard stats', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get dashboard statistics'
      });
    }
  }

  // System Health Monitoring
  async getSystemHealth(tenantId: string): Promise<SystemHealth> {
    try {
      const [database, email, payments, storage, api] = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkEmailHealth(tenantId),
        this.checkPaymentsHealth(tenantId),
        this.checkStorageHealth(tenantId),
        this.checkAPIHealth(tenantId)
      ]);

      return { database, email, payments, storage, api };
    } catch (error) {
      logger.error('Failed to get system health', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get system health'
      });
    }
  }

  // User Management
  async manageUser(
    tenantId: string,
    adminId: string,
    management: UserManagement
  ) {
    try {
      const user = await prisma.user.findFirst({
        where: { id: management.userId, tenantId }
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found'
        });
      }

      let updateData: Prisma.UserUpdateInput = {};

      switch (management.action) {
        case 'promote':
        case 'demote':
          if (!management.newRole) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'New role required for promotion/demotion'
            });
          }
          updateData.role = management.newRole;
          break;
        
        case 'suspend':
          updateData.status = UserStatus.SUSPENDED;
          break;
        
        case 'activate':
          updateData.status = UserStatus.ACTIVE;
          break;
        
        case 'delete':
          // Soft delete by setting status to inactive
          updateData.status = UserStatus.INACTIVE;
          break;
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const updated = await tx.user.update({
          where: { id: management.userId },
          data: updateData
        });

        // Log the admin action
        await tx.auditLog.create({
          data: {
            tenantId,
            userId: adminId,
            action: `user_${management.action}`,
            entityType: 'user',
            entityId: management.userId,
            details: {
              previousRole: user.role,
              newRole: management.newRole,
              reason: management.reason
            }
          }
        });

        return updated;
      });

      // Send notification to user
      if (management.action !== 'delete') {
        await notificationService.create({
          tenantId,
          recipientId: management.userId,
          type: 'SYSTEM_ANNOUNCEMENT',
          title: 'Account Update',
          message: this.getUserManagementMessage(management.action, management.newRole),
          data: { action: management.action, adminId }
        });
      }

      logger.info('User managed by admin', {
        adminId,
        userId: management.userId,
        action: management.action
      });

      return updatedUser;
    } catch (error) {
      logger.error('Failed to manage user', { error, tenantId, management });
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to manage user'
      });
    }
  }

  // Content Moderation
  async moderateContent(
    tenantId: string,
    adminId: string,
    moderation: ContentModeration
  ) {
    try {
      let updateData: any = {};
      let model: any;

      switch (moderation.contentType) {
        case 'event':
          model = prisma.event;
          break;
        case 'page':
          model = prisma.page;
          break;
        case 'comment':
          model = prisma.comment;
          break;
        case 'media':
          model = prisma.media;
          break;
        default:
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid content type'
          });
      }

      switch (moderation.action) {
        case 'approve':
          updateData.status = 'PUBLISHED';
          break;
        case 'reject':
          updateData.status = 'REJECTED';
          break;
        case 'flag':
          updateData.metadata = {
            flagged: true,
            flagReason: moderation.reason
          };
          break;
        case 'remove':
          updateData.status = 'REMOVED';
          break;
      }

      const content = await prisma.$transaction(async (tx) => {
        const updated = await model.update({
          where: { id: moderation.contentId },
          data: updateData
        });

        // Log the moderation action
        await tx.auditLog.create({
          data: {
            tenantId,
            userId: adminId,
            action: `content_${moderation.action}`,
            entityType: moderation.contentType,
            entityId: moderation.contentId,
            details: {
              reason: moderation.reason,
              previousStatus: updated.status
            }
          }
        });

        return updated;
      });

      logger.info('Content moderated', {
        adminId,
        contentType: moderation.contentType,
        contentId: moderation.contentId,
        action: moderation.action
      });

      return content;
    } catch (error) {
      logger.error('Failed to moderate content', { error, tenantId, moderation });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to moderate content'
      });
    }
  }

  // Bulk Operations
  async bulkUserUpdate(
    tenantId: string,
    adminId: string,
    userIds: string[],
    updates: Partial<{ role: UserRole; status: UserStatus }>
  ) {
    try {
      const results = await prisma.$transaction(async (tx) => {
        const updatedUsers = await tx.user.updateMany({
          where: {
            id: { in: userIds },
            tenantId
          },
          data: updates
        });

        // Log bulk action
        await tx.auditLog.create({
          data: {
            tenantId,
            userId: adminId,
            action: 'bulk_user_update',
            entityType: 'user',
            entityId: 'bulk',
            details: {
              userIds,
              updates,
              count: updatedUsers.count
            }
          }
        });

        return updatedUsers;
      });

      logger.info('Bulk user update completed', {
        adminId,
        count: results.count,
        updates
      });

      return results;
    } catch (error) {
      logger.error('Failed to bulk update users', { error, tenantId });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to bulk update users'
      });
    }
  }

  // Export Data
  async exportData(
    tenantId: string,
    dataType: 'users' | 'events' | 'donations' | 'all',
    format: 'csv' | 'json' | 'xlsx'
  ) {
    try {
      let data: any = {};

      if (dataType === 'users' || dataType === 'all') {
        data.users = await prisma.user.findMany({
          where: { tenantId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            profile: true
          }
        });
      }

      if (dataType === 'events' || dataType === 'all') {
        data.events = await prisma.event.findMany({
          where: { tenantId },
          include: {
            _count: {
              select: { rsvps: true }
            }
          }
        });
      }

      if (dataType === 'donations' || dataType === 'all') {
        data.donations = await prisma.donation.findMany({
          where: { tenantId },
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        });
      }

      // Format data based on requested format
      const formattedData = this.formatExportData(data, format);

      logger.info('Data exported', {
        tenantId,
        dataType,
        format,
        recordCount: Object.keys(data).reduce((sum, key) => sum + (data[key]?.length || 0), 0)
      });

      return formattedData;
    } catch (error) {
      logger.error('Failed to export data', { error, tenantId, dataType });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to export data'
      });
    }
  }

  // Private Helper Methods
  private async getOverviewStats(tenantId: string) {
    const [
      totalUsers,
      activeUsers,
      totalEvents,
      upcomingEvents,
      donations,
      monthlyRevenue,
      pendingApplications
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.user.count({ where: { tenantId, status: UserStatus.ACTIVE } }),
      prisma.event.count({ where: { tenantId } }),
      prisma.event.count({
        where: {
          tenantId,
          startDate: { gte: new Date() }
        }
      }),
      prisma.donation.aggregate({
        where: { tenantId, status: 'COMPLETED' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.donation.aggregate({
        where: {
          tenantId,
          status: 'COMPLETED',
          createdAt: {
            gte: startOfMonth(new Date()),
            lte: endOfMonth(new Date())
          }
        },
        _sum: { amount: true }
      }),
      prisma.memberApplication.count({
        where: { tenantId, status: 'PENDING' }
      })
    ]);

    return {
      totalUsers,
      activeUsers,
      totalEvents,
      upcomingEvents,
      totalDonations: donations._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      pendingApplications,
      systemHealth: 'good' as const // Simplified for now
    };
  }

  private async getUserGrowthStats(tenantId: string, periods: Array<{ start: Date; end: Date; label: string }>) {
    return Promise.all(periods.map(async (period) => {
      const [newUsers, activeUsers] = await Promise.all([
        prisma.user.count({
          where: {
            tenantId,
            createdAt: {
              gte: period.start,
              lte: period.end
            }
          }
        }),
        prisma.user.count({
          where: {
            tenantId,
            status: UserStatus.ACTIVE,
            lastLoginAt: {
              gte: period.start,
              lte: period.end
            }
          }
        })
      ]);

      return {
        period: period.label,
        newUsers,
        activeUsers,
        retentionRate: newUsers > 0 ? (activeUsers / newUsers) * 100 : 0
      };
    }));
  }

  private async getEventMetrics(tenantId: string, periods: Array<{ start: Date; end: Date; label: string }>) {
    return Promise.all(periods.map(async (period) => {
      const events = await prisma.event.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: period.start,
            lte: period.end
          }
        },
        include: {
          _count: {
            select: { rsvps: true }
          }
        }
      });

      const totalAttendees = events.reduce((sum, event) => sum + event._count.rsvps, 0);

      return {
        period: period.label,
        eventsCreated: events.length,
        totalAttendees,
        averageAttendance: events.length > 0 ? totalAttendees / events.length : 0
      };
    }));
  }

  private async getRevenueMetrics(tenantId: string, periods: Array<{ start: Date; end: Date; label: string }>) {
    return Promise.all(periods.map(async (period) => {
      const [donations, subscriptions, events] = await Promise.all([
        prisma.donation.aggregate({
          where: {
            tenantId,
            status: 'COMPLETED',
            createdAt: {
              gte: period.start,
              lte: period.end
            }
          },
          _sum: { amount: true }
        }),
        prisma.subscription.aggregate({
          where: {
            tenantId,
            status: 'ACTIVE',
            createdAt: {
              gte: period.start,
              lte: period.end
            }
          },
          _sum: { amount: true }
        }),
        prisma.payment.aggregate({
          where: {
            tenantId,
            type: 'EVENT',
            status: 'COMPLETED',
            createdAt: {
              gte: period.start,
              lte: period.end
            }
          },
          _sum: { amount: true }
        })
      ]);

      const donationAmount = donations._sum.amount || 0;
      const subscriptionAmount = subscriptions._sum.amount || 0;
      const eventAmount = events._sum.amount || 0;

      return {
        period: period.label,
        donations: donationAmount,
        subscriptions: subscriptionAmount,
        events: eventAmount,
        total: donationAmount + subscriptionAmount + eventAmount
      };
    }));
  }

  private async getTopPerformers(tenantId: string) {
    const [events, campaigns, volunteers] = await Promise.all([
      // Top events by attendance and revenue
      prisma.event.findMany({
        where: { tenantId },
        include: {
          _count: { select: { rsvps: true } },
          payments: {
            where: { status: 'COMPLETED' },
            select: { amount: true }
          }
        },
        orderBy: { rsvps: { _count: 'desc' } },
        take: 5
      }).then(events => events.map(event => ({
        id: event.id,
        title: event.title,
        attendees: event._count.rsvps,
        revenue: event.payments.reduce((sum, p) => sum + p.amount, 0)
      }))),

      // Top campaigns by funds raised
      prisma.donation.groupBy({
        by: ['campaign'],
        where: {
          tenantId,
          status: 'COMPLETED',
          campaign: { not: null }
        },
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
        take: 5
      }).then(campaigns => campaigns.map(campaign => ({
        name: campaign.campaign!,
        raised: campaign._sum.amount || 0,
        goal: 100000, // Would need to get from campaign data
        donors: campaign._count
      }))),

      // Top volunteers by hours
      prisma.volunteerLog.groupBy({
        by: ['userId'],
        where: { tenantId },
        _sum: { hours: true },
        _count: true,
        orderBy: { _sum: { hours: 'desc' } },
        take: 5
      }).then(async (volunteers) => {
        const userIds = volunteers.map(v => v.userId);
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true }
        });

        return volunteers.map(volunteer => {
          const user = users.find(u => u.id === volunteer.userId);
          return {
            id: volunteer.userId,
            name: user?.name || 'Unknown',
            hours: volunteer._sum.hours || 0,
            contributions: volunteer._count
          };
        });
      })
    ]);

    return { events, campaigns, volunteers };
  }

  private generatePeriods(period: 'week' | 'month' | 'quarter' | 'year', count: number) {
    const periods = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      let start: Date, end: Date, label: string;

      switch (period) {
        case 'week':
          start = startOfWeek(addDays(now, -i * 7));
          end = endOfWeek(addDays(now, -i * 7));
          label = `Week ${i + 1}`;
          break;
        case 'month':
          start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
          end = endOfMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
          label = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3 - i * 3;
          start = new Date(now.getFullYear(), quarterStart, 1);
          end = new Date(now.getFullYear(), quarterStart + 3, 0);
          label = `Q${Math.floor(quarterStart / 3) + 1} ${start.getFullYear()}`;
          break;
        case 'year':
          start = startOfYear(new Date(now.getFullYear() - i, 0, 1));
          end = endOfYear(new Date(now.getFullYear() - i, 0, 1));
          label = (now.getFullYear() - i).toString();
          break;
      }

      periods.push({ start, end, label });
    }

    return periods;
  }

  private async checkDatabaseHealth() {
    const startTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy' as const,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        status: 'down' as const,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkEmailHealth(tenantId: string) {
    try {
      const lastEmail = await prisma.emailLog.findFirst({
        where: { tenantId },
        orderBy: { sentAt: 'desc' }
      });

      return {
        status: 'healthy' as const,
        lastSent: lastEmail?.sentAt || new Date(0)
      };
    } catch (error) {
      return {
        status: 'degraded' as const,
        lastSent: new Date(0)
      };
    }
  }

  private async checkPaymentsHealth(tenantId: string) {
    try {
      const lastPayment = await prisma.payment.findFirst({
        where: { tenantId, status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' }
      });

      return {
        status: 'healthy' as const,
        lastTransaction: lastPayment?.createdAt || new Date(0)
      };
    } catch (error) {
      return {
        status: 'degraded' as const,
        lastTransaction: new Date(0)
      };
    }
  }

  private async checkStorageHealth(tenantId: string) {
    try {
      const mediaUsage = await prisma.media.aggregate({
        where: { tenantId },
        _sum: { size: true }
      });

      const usage = mediaUsage._sum.size || 0;
      const maxUsage = 10 * 1024 * 1024 * 1024; // 10GB limit

      return {
        status: usage < maxUsage * 0.8 ? 'healthy' as const : 'warning' as const,
        usage: (usage / maxUsage) * 100
      };
    } catch (error) {
      return {
        status: 'degraded' as const,
        usage: 0
      };
    }
  }

  private async checkAPIHealth(tenantId: string) {
    // Simplified API health check
    return {
      status: 'healthy' as const,
      errorRate: 0.5
    };
  }

  private getUserManagementMessage(action: string, newRole?: UserRole): string {
    switch (action) {
      case 'promote':
        return `Your account has been promoted to ${newRole}`;
      case 'demote':
        return `Your account role has been changed to ${newRole}`;
      case 'suspend':
        return 'Your account has been temporarily suspended';
      case 'activate':
        return 'Your account has been reactivated';
      default:
        return 'Your account has been updated';
    }
  }

  private formatExportData(data: any, format: 'csv' | 'json' | 'xlsx') {
    // Simplified formatting - in production would use proper CSV/XLSX libraries
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        // Convert to CSV format (simplified)
        return Object.keys(data).map(key => 
          `${key}\n${data[key].map((item: any) => Object.values(item).join(',')).join('\n')}`
        ).join('\n\n');
      case 'xlsx':
        // Would use library like xlsx to generate proper Excel file
        return data;
      default:
        return data;
    }
  }
}

export const adminService = new AdminService();