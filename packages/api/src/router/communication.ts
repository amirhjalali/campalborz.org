import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { CommunicationService } from "../services/communication";
import { TRPCError } from "@trpc/server";

const communicationService = new CommunicationService();

export const communicationRouter = router({
  // Channel Management
  createChannel: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      type: z.enum(['TEXT', 'VOICE', 'VIDEO', 'ANNOUNCEMENT', 'PRIVATE', 'PROJECT', 'GENERAL']),
      isPublic: z.boolean().optional(),
      settings: z.record(z.any()).optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.createChannel(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create channel'
        });
      }
    }),

  getChannels: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await communicationService.getChannels(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch channels'
        });
      }
    }),

  getChannel: protectedProcedure
    .input(z.object({
      channelId: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await communicationService.getChannel(ctx.session.user.activeTenantId!, input.channelId, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch channel'
        });
      }
    }),

  updateChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      type: z.enum(['TEXT', 'VOICE', 'VIDEO', 'ANNOUNCEMENT', 'PRIVATE', 'PROJECT', 'GENERAL']).optional(),
      isPublic: z.boolean().optional(),
      settings: z.record(z.any()).optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { channelId, ...updateData } = input;
        return await communicationService.updateChannel(ctx.session.user.activeTenantId!, channelId, updateData, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update channel'
        });
      }
    }),

  deleteChannel: protectedProcedure
    .input(z.object({
      channelId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.deleteChannel(ctx.session.user.activeTenantId!, input.channelId, ctx.session.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete channel'
        });
      }
    }),

  joinChannel: protectedProcedure
    .input(z.object({
      channelId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.joinChannel(ctx.session.user.activeTenantId!, input.channelId, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join channel'
        });
      }
    }),

  leaveChannel: protectedProcedure
    .input(z.object({
      channelId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.leaveChannel(ctx.session.user.activeTenantId!, input.channelId, ctx.session.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to leave channel'
        });
      }
    }),

  inviteToChannel: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      inviteeEmail: z.string().email(),
      role: z.enum(['MEMBER', 'MODERATOR']).default('MEMBER')
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.inviteToChannel(ctx.session.user.activeTenantId!, input.channelId, ctx.session.user.id, input.inviteeEmail, input.role);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to invite user to channel'
        });
      }
    }),

  acceptChannelInvitation: protectedProcedure
    .input(z.object({
      token: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.acceptChannelInvitation(input.token, ctx.session.user.id);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to accept invitation'
        });
      }
    }),

  // Messaging
  sendMessage: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      content: z.string(),
      contentType: z.enum(['TEXT', 'MARKDOWN', 'HTML', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LINK', 'POLL', 'EVENT']).default('TEXT'),
      attachments: z.array(z.any()).optional(),
      metadata: z.record(z.any()).optional(),
      threadId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { channelId, ...messageData } = input;
        return await communicationService.sendMessage(ctx.session.user.activeTenantId!, channelId, ctx.session.user.id, messageData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message'
        });
      }
    }),

  getMessages: protectedProcedure
    .input(z.object({
      channelId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(50),
      threadId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { channelId, ...options } = input;
        return await communicationService.getMessages(ctx.session.user.activeTenantId!, channelId, ctx.session.user.id, options);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages'
        });
      }
    }),

  editMessage: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      content: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.editMessage(ctx.session.user.activeTenantId!, input.messageId, ctx.session.user.id, input.content);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to edit message'
        });
      }
    }),

  deleteMessage: protectedProcedure
    .input(z.object({
      messageId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.deleteMessage(ctx.session.user.activeTenantId!, input.messageId, ctx.session.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete message'
        });
      }
    }),

  addReaction: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      emoji: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.addReaction(ctx.session.user.activeTenantId!, input.messageId, ctx.session.user.id, input.emoji);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add reaction'
        });
      }
    }),

  removeReaction: protectedProcedure
    .input(z.object({
      messageId: z.string(),
      emoji: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.removeReaction(ctx.session.user.activeTenantId!, input.messageId, ctx.session.user.id, input.emoji);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove reaction'
        });
      }
    }),

  // Direct Messages
  sendDirectMessage: protectedProcedure
    .input(z.object({
      recipientId: z.string(),
      content: z.string(),
      contentType: z.enum(['TEXT', 'MARKDOWN', 'HTML', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LINK', 'POLL', 'EVENT']).default('TEXT'),
      attachments: z.array(z.any()).optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { recipientId, ...messageData } = input;
        return await communicationService.sendDirectMessage(ctx.session.user.activeTenantId!, ctx.session.user.id, recipientId, messageData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send direct message'
        });
      }
    }),

  getDirectMessages: protectedProcedure
    .input(z.object({
      otherUserId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(50)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { otherUserId, ...options } = input;
        return await communicationService.getDirectMessages(ctx.session.user.activeTenantId!, ctx.session.user.id, otherUserId, options);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch direct messages'
        });
      }
    }),

  markDirectMessageAsRead: protectedProcedure
    .input(z.object({
      messageId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.markDirectMessageAsRead(ctx.session.user.activeTenantId!, input.messageId, ctx.session.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark message as read'
        });
      }
    }),

  // Announcements
  createAnnouncement: protectedProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
      contentType: z.enum(['TEXT', 'MARKDOWN', 'HTML', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'LINK', 'POLL', 'EVENT']).default('TEXT'),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).default('NORMAL'),
      expiresAt: z.date().optional(),
      targetAudience: z.record(z.any()).optional(),
      attachments: z.array(z.any()).optional(),
      metadata: z.record(z.any()).optional(),
      isPublished: z.boolean().default(true)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.createAnnouncement(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create announcement'
        });
      }
    }),

  getAnnouncements: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await communicationService.getAnnouncements(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch announcements'
        });
      }
    }),

  publishAnnouncement: protectedProcedure
    .input(z.object({
      announcementId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.publishAnnouncement(ctx.session.user.activeTenantId!, input.announcementId);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to publish announcement'
        });
      }
    }),

  markAnnouncementAsRead: protectedProcedure
    .input(z.object({
      announcementId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await communicationService.markAnnouncementAsRead(ctx.session.user.activeTenantId!, input.announcementId, ctx.session.user.id);
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark announcement as read'
        });
      }
    }),

  // Forums
  createForum: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      slug: z.string(),
      isPublic: z.boolean().default(true),
      isModerated: z.boolean().default(true),
      settings: z.record(z.any()).optional(),
      metadata: z.record(z.any()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await communicationService.createForum(ctx.session.user.activeTenantId!, ctx.session.user.id, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create forum'
        });
      }
    }),

  getForums: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await communicationService.getForums(ctx.session.user.activeTenantId!, input);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch forums'
        });
      }
    }),

  createForumCategory: protectedProcedure
    .input(z.object({
      forumId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      slug: z.string(),
      sortOrder: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { forumId, ...categoryData } = input;
        return await communicationService.createForumCategory(ctx.session.user.activeTenantId!, forumId, ctx.session.user.id, categoryData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create forum category'
        });
      }
    }),

  createForumTopic: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      title: z.string(),
      content: z.string(),
      contentType: z.enum(['TEXT', 'MARKDOWN', 'HTML']).default('TEXT'),
      tags: z.array(z.string()).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { categoryId, ...topicData } = input;
        return await communicationService.createForumTopic(ctx.session.user.activeTenantId!, categoryId, ctx.session.user.id, topicData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create forum topic'
        });
      }
    }),

  createForumPost: protectedProcedure
    .input(z.object({
      topicId: z.string(),
      content: z.string(),
      contentType: z.enum(['TEXT', 'MARKDOWN', 'HTML']).default('TEXT'),
      parentId: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { topicId, ...postData } = input;
        return await communicationService.createForumPost(ctx.session.user.activeTenantId!, topicId, ctx.session.user.id, postData);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create forum post'
        });
      }
    }),

  getForumTopics: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { categoryId, ...options } = input;
        return await communicationService.getForumTopics(ctx.session.user.activeTenantId!, categoryId, options);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch forum topics'
        });
      }
    }),

  getForumPosts: protectedProcedure
    .input(z.object({
      topicId: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { topicId, ...options } = input;
        return await communicationService.getForumPosts(ctx.session.user.activeTenantId!, topicId, options);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch forum posts'
        });
      }
    }),

  // Analytics
  getCommunicationStats: protectedProcedure
    .input(z.object({
      period: z.enum(['day', 'week', 'month']).default('week')
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await communicationService.getCommunicationStats(ctx.session.user.activeTenantId!, input.period);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch communication statistics'
        });
      }
    })
});