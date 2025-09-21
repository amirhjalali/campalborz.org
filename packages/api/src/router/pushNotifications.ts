import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { PushNotificationService } from "../services/pushNotifications";
import { TRPCError } from "@trpc/server";

const pushNotificationService = new PushNotificationService();

export const pushNotificationsRouter = router({
  // Device Management
  registerDevice: protectedProcedure
    .input(z.object({
      deviceToken: z.string(),
      platform: z.enum(['IOS', 'ANDROID', 'WEB', 'DESKTOP']),
      deviceName: z.string().optional(),
      appVersion: z.string().optional(),
      osVersion: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.registerDevice(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register device'
        });
      }
    }),

  unregisterDevice: protectedProcedure
    .input(z.object({
      deviceToken: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await pushNotificationService.unregisterDevice(input.deviceToken);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to unregister device'
        });
      }
    }),

  getUserDevices: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await pushNotificationService.getUserDevices(ctx.session.user.activeTenantId!, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user devices'
        });
      }
    }),

  updateDeviceLastUsed: protectedProcedure
    .input(z.object({
      deviceToken: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await pushNotificationService.updateDeviceLastUsed(input.deviceToken);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update device usage'
        });
      }
    }),

  // Notification Sending
  sendNotification: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      data: z.record(z.any()).optional(),
      imageUrl: z.string().optional(),
      clickAction: z.string().optional(),
      badge: z.number().optional(),
      sound: z.string().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      scheduledFor: z.date().optional(),
      expiresAt: z.date().optional(),
      targetCriteria: z.object({
        userIds: z.array(z.string()).optional(),
        membershipTypes: z.array(z.string()).optional(),
        eventAttendees: z.array(z.string()).optional(),
        platforms: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        excludeUserIds: z.array(z.string()).optional(),
        maxDevices: z.number().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { targetCriteria, ...notificationData } = input;
        return await pushNotificationService.sendImmediateNotification(
          ctx.session.user.activeTenantId!,
          notificationData,
          targetCriteria,
          ctx.session.user.id
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send notification'
        });
      }
    }),

  sendToUser: protectedProcedure
    .input(z.object({
      userId: z.string(),
      title: z.string(),
      body: z.string(),
      data: z.record(z.any()).optional(),
      imageUrl: z.string().optional(),
      clickAction: z.string().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
      category: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, ...notificationData } = input;
        return await pushNotificationService.sendImmediateNotification(
          ctx.session.user.activeTenantId!,
          notificationData,
          { userIds: [userId] },
          ctx.session.user.id
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send notification to user'
        });
      }
    }),

  sendToEventAttendees: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      title: z.string(),
      body: z.string(),
      data: z.record(z.any()).optional(),
      imageUrl: z.string().optional(),
      clickAction: z.string().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
      category: z.string().default('event')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { eventId, ...notificationData } = input;
        return await pushNotificationService.sendImmediateNotification(
          ctx.session.user.activeTenantId!,
          notificationData,
          { eventAttendees: [eventId] },
          ctx.session.user.id
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send notification to event attendees'
        });
      }
    }),

  // Templates
  createTemplate: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      title: z.string(),
      body: z.string(),
      data: z.record(z.any()).optional(),
      imageUrl: z.string().optional(),
      clickAction: z.string().optional(),
      sound: z.string().optional(),
      category: z.string().optional(),
      variables: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.createTemplate(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create notification template'
        });
      }
    }),

  getTemplates: protectedProcedure
    .input(z.object({
      isActive: z.boolean().default(true)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.getTemplates(ctx.session.user.activeTenantId!, input.isActive);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification templates'
        });
      }
    }),

  updateTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      title: z.string().optional(),
      body: z.string().optional(),
      data: z.record(z.any()).optional(),
      imageUrl: z.string().optional(),
      clickAction: z.string().optional(),
      sound: z.string().optional(),
      category: z.string().optional(),
      variables: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { templateId, ...updateData } = input;
        return await pushNotificationService.updateTemplate(ctx.session.user.activeTenantId!, templateId, updateData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification template'
        });
      }
    }),

  deleteTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await pushNotificationService.deleteTemplate(ctx.session.user.activeTenantId!, input.templateId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete notification template'
        });
      }
    }),

  renderTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      variables: z.record(z.any())
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.renderTemplate(input.templateId, input.variables);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to render notification template'
        });
      }
    }),

  sendFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.string(),
      variables: z.record(z.any()),
      targetCriteria: z.object({
        userIds: z.array(z.string()).optional(),
        membershipTypes: z.array(z.string()).optional(),
        eventAttendees: z.array(z.string()).optional(),
        platforms: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        excludeUserIds: z.array(z.string()).optional(),
        maxDevices: z.number().optional()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const rendered = await pushNotificationService.renderTemplate(input.templateId, input.variables);
        return await pushNotificationService.sendImmediateNotification(
          ctx.session.user.activeTenantId!,
          rendered,
          input.targetCriteria,
          ctx.session.user.id
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send notification from template'
        });
      }
    }),

  // Campaigns
  createCampaign: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      templateId: z.string(),
      targetAudience: z.record(z.any()),
      scheduledFor: z.date().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.createCampaign(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create notification campaign'
        });
      }
    }),

  getCampaigns: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await pushNotificationService.getCampaigns(ctx.session.user.activeTenantId!);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification campaigns'
        });
      }
    }),

  executeCampaign: protectedProcedure
    .input(z.object({
      campaignId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.executeCampaign(ctx.session.user.activeTenantId!, input.campaignId);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to execute notification campaign'
        });
      }
    }),

  // User Preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      category: z.string(),
      isEnabled: z.boolean().optional(),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
      frequency: z.enum(['IMMEDIATE', 'HOURLY', 'DAILY', 'WEEKLY', 'NEVER']).optional(),
      quietHours: z.object({
        start: z.string(),
        end: z.string(),
        timezone: z.string()
      }).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { category, ...preferences } = input;
        return await pushNotificationService.updateNotificationPreferences(
          ctx.session.user.activeTenantId!,
          ctx.session.user.id,
          category,
          preferences
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update notification preferences'
        });
      }
    }),

  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        return await pushNotificationService.getUserPreferences(ctx.session.user.activeTenantId!, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification preferences'
        });
      }
    }),

  // Analytics
  getAnalytics: protectedProcedure
    .input(z.object({
      period: z.enum(['day', 'week', 'month']).default('week')
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.getNotificationAnalytics(ctx.session.user.activeTenantId!, input.period);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch notification analytics'
        });
      }
    }),

  updateAnalytics: protectedProcedure
    .input(z.object({
      date: z.date().default(() => new Date())
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await pushNotificationService.updateAnalytics(ctx.session.user.activeTenantId!, input.date);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update analytics'
        });
      }
    }),

  // Maintenance Operations
  scheduleNotifications: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await pushNotificationService.scheduleNotifications();
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to schedule notifications'
        });
      }
    }),

  cleanupExpiredNotifications: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        await pushNotificationService.cleanupExpiredNotifications();
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cleanup expired notifications'
        });
      }
    }),

  retryFailedDeliveries: protectedProcedure
    .input(z.object({
      maxRetries: z.number().default(3)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await pushNotificationService.retryFailedDeliveries(input.maxRetries);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retry failed deliveries'
        });
      }
    }),

  // Delivery Status Updates (for mobile apps to report back)
  updateDeliveryStatus: protectedProcedure
    .input(z.object({
      notificationId: z.string(),
      deviceToken: z.string(),
      status: z.enum(['DELIVERED', 'CLICKED']),
      timestamp: z.date().default(() => new Date())
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // This endpoint allows mobile apps to report delivery confirmations
        const device = await prisma.pushDevice.findUnique({
          where: { deviceToken: input.deviceToken }
        });

        if (!device) {
          throw new Error('Device not found');
        }

        const updateData: any = { status: input.status };
        if (input.status === 'DELIVERED') updateData.deliveredAt = input.timestamp;
        if (input.status === 'CLICKED') updateData.clickedAt = input.timestamp;

        await prisma.notificationDelivery.updateMany({
          where: {
            notificationId: input.notificationId,
            deviceId: device.id
          },
          data: updateData
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update delivery status'
        });
      }
    }),

  // Test Notifications
  sendTestNotification: protectedProcedure
    .input(z.object({
      title: z.string().default('Test Notification'),
      body: z.string().default('This is a test notification'),
      data: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await pushNotificationService.sendImmediateNotification(
          ctx.session.user.activeTenantId!,
          input,
          { userIds: [ctx.session.user.id] },
          ctx.session.user.id
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send test notification'
        });
      }
    })
});