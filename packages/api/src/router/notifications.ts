import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createNotificationService } from "../services/notifications";

// Notification schemas
const SendNotificationSchema = z.object({
  recipientId: z.string().optional(),
  recipientIds: z.array(z.string()).optional(),
  type: z.enum([
    "MEMBER_APPLICATION",
    "MEMBER_APPROVED", 
    "MEMBER_REJECTED",
    "EVENT_CREATED",
    "EVENT_UPDATED",
    "EVENT_CANCELLED",
    "EVENT_RSVP",
    "DONATION_RECEIVED",
    "PAYMENT_FAILED",
    "SYSTEM_ANNOUNCEMENT",
    "REMINDER",
    "WELCOME",
    "ADMIN_MESSAGE"
  ]),
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.any()).optional(),
  channel: z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]).default("IN_APP"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  expiresAt: z.string().transform(str => new Date(str)).optional(),
});

const BroadcastNotificationSchema = z.object({
  type: z.enum([
    "SYSTEM_ANNOUNCEMENT",
    "REMINDER", 
    "ADMIN_MESSAGE",
    "EVENT_CREATED",
    "EVENT_UPDATED",
    "EVENT_CANCELLED"
  ]),
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.any()).optional(),
  channel: z.enum(["IN_APP", "EMAIL", "SMS", "PUSH"]).default("IN_APP"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  roles: z.array(z.enum(["SUPER_ADMIN", "TENANT_ADMIN", "ADMIN", "MODERATOR", "MEMBER"])).optional(),
  userIds: z.array(z.string()).optional(),
});

const GetNotificationsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  unreadOnly: z.boolean().default(false),
  type: z.enum([
    "MEMBER_APPLICATION",
    "MEMBER_APPROVED",
    "MEMBER_REJECTED", 
    "EVENT_CREATED",
    "EVENT_UPDATED",
    "EVENT_CANCELLED",
    "EVENT_RSVP",
    "DONATION_RECEIVED",
    "PAYMENT_FAILED",
    "SYSTEM_ANNOUNCEMENT",
    "REMINDER",
    "WELCOME",
    "ADMIN_MESSAGE"
  ]).optional(),
});

export const notificationsRouter = router({
  // Send notification to specific users
  send: protectedProcedure
    .input(SendNotificationSchema)
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
          message: "Insufficient permissions to send notifications",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const result = await notificationService.send({
          tenantId: ctx.tenant.id,
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          recipientIds: input.recipientIds,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
          channel: input.channel,
          priority: input.priority,
          expiresAt: input.expiresAt,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send notification",
        });
      }
    }),

  // Broadcast notification to multiple users
  broadcast: protectedProcedure
    .input(BroadcastNotificationSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can broadcast notifications",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const result = await notificationService.broadcast({
          tenantId: ctx.tenant.id,
          senderId: ctx.user.id,
          type: input.type,
          title: input.title,
          message: input.message,
          data: input.data,
          channel: input.channel,
          priority: input.priority,
          roles: input.roles,
          userIds: input.userIds,
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to broadcast notification",
        });
      }
    }),

  // Get notifications for current user
  list: protectedProcedure
    .input(GetNotificationsSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const result = await notificationService.getForUser(
          ctx.user.id,
          ctx.tenant.id,
          {
            limit: input.limit,
            offset: input.offset,
            unreadOnly: input.unreadOnly,
            type: input.type,
          }
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get notifications",
        });
      }
    }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const success = await notificationService.markAsRead(
          input.notificationId,
          ctx.user.id
        );

        return { success };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark notification as read",
        });
      }
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const count = await notificationService.markAllAsRead(
          ctx.user.id,
          ctx.tenant.id
        );

        return { count };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark all notifications as read",
        });
      }
    }),

  // Delete notification
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const success = await notificationService.delete(
          input.notificationId,
          ctx.user.id
        );

        return { success };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete notification",
        });
      }
    }),

  // Get unread count
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      try {
        const count = await ctx.prisma.notification.count({
          where: {
            recipientId: ctx.user.id,
            tenantId: ctx.tenant.id,
            isRead: false,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } },
            ],
          },
        });

        return { count };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get unread count",
        });
      }
    }),

  // Get notification statistics (admin only)
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view notification statistics",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const stats = await notificationService.getStats(ctx.tenant.id);

        return stats;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get notification statistics",
        });
      }
    }),

  // Cleanup expired notifications (admin only)
  cleanup: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      // Check permissions
      if (!["admin"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can cleanup notifications",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const count = await notificationService.cleanupExpired();

        return { count };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cleanup notifications",
        });
      }
    }),

  // Helper endpoints for common notification types
  sendWelcome: protectedProcedure
    .input(z.object({
      memberId: z.string(),
      memberName: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        });
      }

      try {
        const notificationService = createNotificationService(ctx.prisma);
        
        const result = await notificationService.sendMemberApproved(
          ctx.tenant.id,
          input.memberId,
          input.memberName
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send welcome notification",
        });
      }
    }),

  sendEventReminder: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      eventTitle: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.tenant || !ctx.user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Authentication required",
        });
      }

      if (!["admin", "moderator"].includes(ctx.user.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        });
      }

      try {
        // Get event attendees
        const attendees = await ctx.prisma.eventRSVP.findMany({
          where: {
            eventId: input.eventId,
            status: "CONFIRMED",
          },
          select: { userId: true },
        });

        if (attendees.length === 0) {
          return { success: true, count: 0 };
        }

        const notificationService = createNotificationService(ctx.prisma);
        
        const result = await notificationService.sendEventReminder(
          ctx.tenant.id,
          input.eventId,
          input.eventTitle,
          attendees.map(a => a.userId)
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send event reminder",
        });
      }
    }),
});