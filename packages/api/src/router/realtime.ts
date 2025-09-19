import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { realtimeService } from '../index';

export const realtimeRouter = router({
  // Get online users for a tenant
  getOnlineUsers: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const users = await realtimeService.getOnlineUsers(ctx.user.tenantId);
        return { users };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get online users'
        });
      }
    }),

  // Get chat history for a room
  getChatHistory: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      limit: z.number().min(1).max(100).default(50)
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Validate user has access to this chat room
        // This would be implemented based on your business logic
        const messages = await realtimeService.getChatHistory(input.roomId, input.limit);
        return { messages };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get chat history'
        });
      }
    }),

  // Broadcast a notification to users
  broadcastNotification: protectedProcedure
    .input(z.object({
      type: z.enum(['info', 'success', 'warning', 'error']),
      title: z.string(),
      message: z.string(),
      targetType: z.enum(['tenant', 'user', 'role']),
      targetId: z.string().optional(),
      role: z.string().optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify user has permission to broadcast notifications
        if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPER_ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Insufficient permissions to broadcast notifications'
          });
        }

        const notification = {
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata,
          timestamp: new Date(),
          userId: ctx.user.id
        };

        switch (input.targetType) {
          case 'tenant':
            await realtimeService.broadcastToTenant(
              ctx.user.tenantId,
              'notification:broadcast',
              notification
            );
            break;
          case 'user':
            if (!input.targetId) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Target user ID is required'
              });
            }
            await realtimeService.broadcastToUser(
              input.targetId,
              'notification:broadcast',
              notification
            );
            break;
          case 'role':
            // For role-based broadcasting, we would need to query users with that role
            // and broadcast to each individually
            await realtimeService.broadcastToTenant(
              ctx.user.tenantId,
              'notification:role_broadcast',
              { ...notification, targetRole: input.role }
            );
            break;
        }

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to broadcast notification'
        });
      }
    }),

  // Broadcast an event update
  broadcastEventUpdate: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      updateType: z.enum(['created', 'updated', 'deleted', 'rsvp_changed']),
      eventData: z.record(z.any()),
      targetType: z.enum(['tenant', 'attendees']).default('tenant')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const eventUpdate = {
          eventId: input.eventId,
          updateType: input.updateType,
          eventData: input.eventData,
          timestamp: new Date(),
          updatedBy: {
            id: ctx.user.id,
            name: ctx.user.name
          }
        };

        if (input.targetType === 'tenant') {
          await realtimeService.broadcastToTenant(
            ctx.user.tenantId,
            'event:update',
            eventUpdate
          );
        } else if (input.targetType === 'attendees') {
          // Broadcast to event-specific room
          await realtimeService.broadcastToRoom(
            `event:${input.eventId}`,
            'event:update',
            eventUpdate
          );
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to broadcast event update'
        });
      }
    }),

  // Get realtime server stats (admin only)
  getServerStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (ctx.user.role !== 'SUPER_ADMIN') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Super admin access required'
          });
        }

        const connectedSockets = realtimeService.getConnectedSocketsCount();
        const onlineUsers = await realtimeService.getOnlineUsers(ctx.user.tenantId);

        return {
          connectedSockets,
          onlineUsersCount: onlineUsers.length,
          serverUptime: process.uptime(),
          memoryUsage: process.memoryUsage()
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get server stats'
        });
      }
    }),

  // Send a direct message to a user
  sendDirectMessage: protectedProcedure
    .input(z.object({
      recipientId: z.string(),
      message: z.string(),
      type: z.enum(['text', 'system', 'notification']).default('text'),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const directMessage = {
          id: `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          senderId: ctx.user.id,
          senderName: ctx.user.name,
          recipientId: input.recipientId,
          message: input.message,
          type: input.type,
          metadata: input.metadata,
          timestamp: new Date()
        };

        // Send to recipient
        await realtimeService.broadcastToUser(
          input.recipientId,
          'message:direct',
          directMessage
        );

        // Send confirmation to sender
        await realtimeService.broadcastToUser(
          ctx.user.id,
          'message:sent',
          { messageId: directMessage.id, recipientId: input.recipientId }
        );

        return { success: true, messageId: directMessage.id };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send direct message'
        });
      }
    }),

  // Join a realtime room (for events, chats, etc.)
  joinRoom: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      roomType: z.enum(['event', 'chat', 'project', 'general'])
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate user has access to this room
        // This would be implemented based on your business logic
        
        return { 
          success: true, 
          roomId: input.roomId,
          message: `Joined ${input.roomType} room: ${input.roomId}`
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join room'
        });
      }
    }),

  // Leave a realtime room
  leaveRoom: protectedProcedure
    .input(z.object({
      roomId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        return { 
          success: true, 
          roomId: input.roomId,
          message: `Left room: ${input.roomId}`
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to leave room'
        });
      }
    })
});