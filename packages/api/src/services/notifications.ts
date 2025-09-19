// Notification service for in-app and push notifications
import { PrismaClient } from "@prisma/client";

export interface NotificationData {
  tenantId: string;
  senderId?: string;
  recipientId?: string;
  recipientIds?: string[];
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channel?: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  expiresAt?: Date;
}

export interface BroadcastNotification {
  tenantId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  channel?: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  roles?: string[]; // Target specific roles
  userIds?: string[]; // Target specific users
}

class NotificationService {
  constructor(private prisma: PrismaClient) {}

  // Send notification to a single user or multiple users
  async send(notification: NotificationData): Promise<{ success: boolean; count: number }> {
    try {
      const recipientIds = notification.recipientIds || 
                          (notification.recipientId ? [notification.recipientId] : []);

      if (recipientIds.length === 0) {
        throw new Error("No recipients specified");
      }

      // Create notifications for all recipients
      const notifications = await this.prisma.notification.createMany({
        data: recipientIds.map(recipientId => ({
          tenantId: notification.tenantId,
          senderId: notification.senderId || null,
          recipientId,
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          channel: notification.channel || "IN_APP",
          priority: notification.priority || "NORMAL",
          expiresAt: notification.expiresAt,
        })),
      });

      // In production, trigger real-time updates via WebSocket
      // this.broadcastRealtime(recipientIds, notification);

      // Send via other channels if specified
      if (notification.channel === "EMAIL") {
        // Integration with email service
        // await this.sendEmailNotifications(recipientIds, notification);
      }

      console.log(`📬 Sent notification to ${recipientIds.length} users:`, notification.title);

      return {
        success: true,
        count: notifications.count,
      };
    } catch (error) {
      console.error("Failed to send notification:", error);
      return {
        success: false,
        count: 0,
      };
    }
  }

  // Broadcast notification to multiple users based on criteria
  async broadcast(broadcast: BroadcastNotification): Promise<{ success: boolean; count: number }> {
    try {
      // Find target users
      const where: any = {
        tenantId: broadcast.tenantId,
        status: "ACTIVE",
      };

      if (broadcast.roles && broadcast.roles.length > 0) {
        where.role = { in: broadcast.roles };
      }

      if (broadcast.userIds && broadcast.userIds.length > 0) {
        where.id = { in: broadcast.userIds };
      }

      const users = await this.prisma.user.findMany({
        where,
        select: { id: true },
      });

      if (users.length === 0) {
        return { success: true, count: 0 };
      }

      // Send notifications to all matching users
      const result = await this.send({
        tenantId: broadcast.tenantId,
        senderId: broadcast.senderId,
        recipientIds: users.map(u => u.id),
        type: broadcast.type,
        title: broadcast.title,
        message: broadcast.message,
        data: broadcast.data,
        channel: broadcast.channel,
        priority: broadcast.priority,
      });

      return result;
    } catch (error) {
      console.error("Failed to broadcast notification:", error);
      return {
        success: false,
        count: 0,
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string, tenantId: string): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          recipientId: userId,
          tenantId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      return 0;
    }
  }

  // Delete notification
  async delete(notificationId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.notification.deleteMany({
        where: {
          id: notificationId,
          recipientId: userId,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      return false;
    }
  }

  // Get notifications for a user
  async getForUser(
    userId: string,
    tenantId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: string;
    } = {}
  ) {
    try {
      const where: any = {
        recipientId: userId,
        tenantId,
      };

      if (options.unreadOnly) {
        where.isRead = false;
      }

      if (options.type) {
        where.type = options.type;
      }

      // Remove expired notifications
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];

      const [notifications, unreadCount, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          take: options.limit || 20,
          skip: options.offset || 0,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        }),
        this.prisma.notification.count({
          where: {
            recipientId: userId,
            tenantId,
            isRead: false,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        }),
        this.prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        unreadCount,
        total,
        hasMore: total > (options.offset || 0) + (options.limit || 20),
      };
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return {
        notifications: [],
        unreadCount: 0,
        total: 0,
        hasMore: false,
      };
    }
  }

  // Cleanup expired notifications
  async cleanupExpired(): Promise<number> {
    try {
      const result = await this.prisma.notification.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });

      if (result.count > 0) {
        console.log(`🧹 Cleaned up ${result.count} expired notifications`);
      }

      return result.count;
    } catch (error) {
      console.error("Failed to cleanup expired notifications:", error);
      return 0;
    }
  }

  // Get notification statistics
  async getStats(tenantId: string) {
    try {
      const [
        totalSent,
        totalUnread,
        todaySent,
        typeBreakdown,
      ] = await Promise.all([
        this.prisma.notification.count({
          where: { tenantId },
        }),
        this.prisma.notification.count({
          where: { tenantId, isRead: false },
        }),
        this.prisma.notification.count({
          where: {
            tenantId,
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
        this.prisma.notification.groupBy({
          by: ["type"],
          where: { tenantId },
          _count: { type: true },
        }),
      ]);

      return {
        totalSent,
        totalUnread,
        todaySent,
        typeBreakdown: typeBreakdown.map(item => ({
          type: item.type,
          count: item._count.type,
        })),
      };
    } catch (error) {
      console.error("Failed to get notification stats:", error);
      return {
        totalSent: 0,
        totalUnread: 0,
        todaySent: 0,
        typeBreakdown: [],
      };
    }
  }

  // Helper methods for common notification types
  async sendMemberApplicationReceived(tenantId: string, applicantId: string, applicantName: string) {
    return this.send({
      tenantId,
      recipientId: applicantId,
      type: "MEMBER_APPLICATION",
      title: "Application Received",
      message: `Hi ${applicantName}, we've received your application and will review it soon!`,
      priority: "NORMAL",
    });
  }

  async sendMemberApproved(tenantId: string, memberId: string, memberName: string) {
    return this.send({
      tenantId,
      recipientId: memberId,
      type: "MEMBER_APPROVED",
      title: "Welcome to the community!",
      message: `Congratulations ${memberName}, your application has been approved!`,
      priority: "HIGH",
    });
  }

  async sendEventReminder(tenantId: string, eventId: string, eventTitle: string, attendeeIds: string[]) {
    return this.send({
      tenantId,
      recipientIds: attendeeIds,
      type: "REMINDER",
      title: "Event Reminder",
      message: `Don't forget about "${eventTitle}" happening soon!`,
      data: { eventId },
      priority: "NORMAL",
    });
  }

  async sendDonationReceived(tenantId: string, donorId: string, amount: number, campaign?: string) {
    if (!donorId) return { success: true, count: 0 }; // Anonymous donation

    const formattedAmount = `$${(amount / 100).toFixed(2)}`;
    const campaignText = campaign ? ` to ${campaign}` : "";

    return this.send({
      tenantId,
      recipientId: donorId,
      type: "DONATION_RECEIVED",
      title: "Thank you for your donation!",
      message: `Your donation of ${formattedAmount}${campaignText} has been processed successfully.`,
      priority: "NORMAL",
    });
  }

  async sendSystemAnnouncement(tenantId: string, title: string, message: string, roles?: string[]) {
    return this.broadcast({
      tenantId,
      type: "SYSTEM_ANNOUNCEMENT",
      title,
      message,
      roles,
      priority: "HIGH",
    });
  }
}

export const createNotificationService = (prisma: PrismaClient) => {
  return new NotificationService(prisma);
};