import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateChannelData {
  name: string;
  description?: string;
  type: 'TEXT' | 'VOICE' | 'VIDEO' | 'ANNOUNCEMENT' | 'PRIVATE' | 'PROJECT' | 'GENERAL';
  isPublic?: boolean;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SendMessageData {
  content: string;
  contentType?: 'TEXT' | 'MARKDOWN' | 'HTML' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'LINK' | 'POLL' | 'EVENT';
  attachments?: any[];
  metadata?: Record<string, any>;
  threadId?: string;
}

export interface CreateForumData {
  name: string;
  description?: string;
  slug: string;
  isPublic?: boolean;
  isModerated?: boolean;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  contentType?: 'TEXT' | 'MARKDOWN' | 'HTML' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'LINK' | 'POLL' | 'EVENT';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' | 'CRITICAL';
  expiresAt?: Date;
  targetAudience?: Record<string, any>;
  attachments?: any[];
  metadata?: Record<string, any>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export class CommunicationService {
  
  // Channel Management
  async createChannel(tenantId: string, userId: string, data: CreateChannelData) {
    const channel = await prisma.communicationChannel.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
            tenantId
          }
        }
      },
      include: {
        creator: true,
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      }
    });

    return channel;
  }

  async getChannels(tenantId: string, userId?: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isArchived: false
    };

    if (userId) {
      where.OR = [
        { isPublic: true },
        {
          members: {
            some: { userId }
          }
        }
      ];
    } else {
      where.isPublic = true;
    }

    const [channels, total] = await Promise.all([
      prisma.communicationChannel.findMany({
        where,
        include: {
          creator: true,
          members: {
            include: {
              user: true
            }
          },
          _count: {
            select: {
              members: true,
              messages: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.communicationChannel.count({ where })
    ]);

    return {
      channels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getChannel(tenantId: string, channelId: string, userId?: string) {
    const channel = await prisma.communicationChannel.findFirst({
      where: {
        id: channelId,
        tenantId,
        OR: userId ? [
          { isPublic: true },
          {
            members: {
              some: { userId }
            }
          }
        ] : [{ isPublic: true }]
      },
      include: {
        creator: true,
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      }
    });

    if (!channel) {
      throw new Error('Channel not found or access denied');
    }

    return channel;
  }

  async updateChannel(tenantId: string, channelId: string, data: Partial<CreateChannelData>, userId: string) {
    // Check if user has permission to update
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        tenantId,
        role: {
          in: ['OWNER', 'ADMIN', 'MODERATOR']
        }
      }
    });

    if (!member) {
      throw new Error('Insufficient permissions to update channel');
    }

    const channel = await prisma.communicationChannel.update({
      where: { id: channelId },
      data,
      include: {
        creator: true,
        members: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      }
    });

    return channel;
  }

  async deleteChannel(tenantId: string, channelId: string, userId: string) {
    // Check if user is owner
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        tenantId,
        role: 'OWNER'
      }
    });

    if (!member) {
      throw new Error('Only channel owner can delete channel');
    }

    await prisma.communicationChannel.delete({
      where: { id: channelId }
    });
  }

  // Channel Membership
  async joinChannel(tenantId: string, channelId: string, userId: string) {
    const channel = await prisma.communicationChannel.findFirst({
      where: {
        id: channelId,
        tenantId,
        isPublic: true,
        isArchived: false
      }
    });

    if (!channel) {
      throw new Error('Channel not found or not accessible');
    }

    const existingMember = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId
        }
      }
    });

    if (existingMember) {
      throw new Error('Already a member of this channel');
    }

    const member = await prisma.channelMember.create({
      data: {
        channelId,
        userId,
        tenantId,
        role: 'MEMBER'
      },
      include: {
        user: true,
        channel: true
      }
    });

    return member;
  }

  async leaveChannel(tenantId: string, channelId: string, userId: string) {
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        tenantId
      }
    });

    if (!member) {
      throw new Error('Not a member of this channel');
    }

    if (member.role === 'OWNER') {
      throw new Error('Channel owner cannot leave. Transfer ownership first.');
    }

    await prisma.channelMember.delete({
      where: { id: member.id }
    });
  }

  async inviteToChannel(tenantId: string, channelId: string, inviterId: string, inviteeEmail: string, role: 'MEMBER' | 'MODERATOR' = 'MEMBER') {
    // Check if inviter has permission
    const inviterMember = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId: inviterId,
        tenantId,
        role: {
          in: ['OWNER', 'ADMIN', 'MODERATOR']
        }
      }
    });

    if (!inviterMember) {
      throw new Error('Insufficient permissions to invite users');
    }

    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.channelInvitation.create({
      data: {
        channelId,
        invitedBy: inviterId,
        invitedEmail: inviteeEmail,
        role,
        token,
        expiresAt,
        tenantId
      },
      include: {
        channel: true,
        inviter: true
      }
    });

    return invitation;
  }

  async acceptChannelInvitation(token: string, userId?: string) {
    const invitation = await prisma.channelInvitation.findUnique({
      where: { token },
      include: {
        channel: true
      }
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'PENDING') {
      throw new Error('Invitation has already been responded to');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Update invitation status
    await prisma.channelInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        respondedAt: new Date(),
        invitedUserId: userId
      }
    });

    // Add user to channel if userId provided
    if (userId) {
      await prisma.channelMember.create({
        data: {
          channelId: invitation.channelId,
          userId,
          role: invitation.role,
          tenantId: invitation.tenantId
        }
      });
    }

    return invitation;
  }

  // Messaging
  async sendMessage(tenantId: string, channelId: string, userId: string, data: SendMessageData) {
    // Check if user is member of channel
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        tenantId
      }
    });

    if (!member) {
      throw new Error('Not a member of this channel');
    }

    const message = await prisma.message.create({
      data: {
        ...data,
        channelId,
        authorId: userId,
        tenantId
      },
      include: {
        author: true,
        reactions: {
          include: {
            user: true
          }
        },
        mentions: {
          include: {
            mentioned: true
          }
        }
      }
    });

    return message;
  }

  async getMessages(tenantId: string, channelId: string, userId: string, options: PaginationOptions & { threadId?: string } = {}) {
    // Check if user is member of channel
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId,
        tenantId
      }
    });

    if (!member) {
      throw new Error('Not a member of this channel');
    }

    const { page = 1, limit = 50, threadId } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      channelId,
      tenantId,
      isDeleted: false
    };

    if (threadId) {
      where.threadId = threadId;
    } else {
      where.threadId = null; // Only root messages
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          author: true,
          reactions: {
            include: {
              user: true
            }
          },
          mentions: {
            include: {
              mentioned: true
            }
          },
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ]);

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async editMessage(tenantId: string, messageId: string, userId: string, content: string) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        authorId: userId,
        tenantId,
        isDeleted: false
      }
    });

    if (!message) {
      throw new Error('Message not found or no permission to edit');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date()
      },
      include: {
        author: true,
        reactions: {
          include: {
            user: true
          }
        }
      }
    });

    return updatedMessage;
  }

  async deleteMessage(tenantId: string, messageId: string, userId: string) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        tenantId
      },
      include: {
        channel: {
          include: {
            members: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is author or has moderation permissions
    const isAuthor = message.authorId === userId;
    const hasModerationRights = message.channel.members.some(
      member => ['OWNER', 'ADMIN', 'MODERATOR'].includes(member.role)
    );

    if (!isAuthor && !hasModerationRights) {
      throw new Error('No permission to delete this message');
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });
  }

  async addReaction(tenantId: string, messageId: string, userId: string, emoji: string) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        tenantId,
        isDeleted: false
      }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    const reaction = await prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji
        }
      },
      update: {},
      create: {
        messageId,
        userId,
        emoji,
        tenantId
      },
      include: {
        user: true
      }
    });

    return reaction;
  }

  async removeReaction(tenantId: string, messageId: string, userId: string, emoji: string) {
    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji,
        tenantId
      }
    });
  }

  // Direct Messages
  async sendDirectMessage(tenantId: string, senderId: string, recipientId: string, data: Omit<SendMessageData, 'threadId'>) {
    const message = await prisma.directMessage.create({
      data: {
        ...data,
        senderId,
        recipientId,
        tenantId
      },
      include: {
        sender: true,
        recipient: true,
        reactions: {
          include: {
            user: true
          }
        }
      }
    });

    return message;
  }

  async getDirectMessages(tenantId: string, userId: string, otherUserId: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      isDeleted: false,
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId }
      ]
    };

    const [messages, total] = await Promise.all([
      prisma.directMessage.findMany({
        where,
        include: {
          sender: true,
          recipient: true,
          reactions: {
            include: {
              user: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.directMessage.count({ where })
    ]);

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markDirectMessageAsRead(tenantId: string, messageId: string, userId: string) {
    await prisma.directMessage.updateMany({
      where: {
        id: messageId,
        recipientId: userId,
        tenantId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Announcements
  async createAnnouncement(tenantId: string, userId: string, data: CreateAnnouncementData) {
    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId
      },
      include: {
        creator: true
      }
    });

    // If published, create recipient records
    if (data.isPublished !== false) {
      await this.publishAnnouncement(tenantId, announcement.id);
    }

    return announcement;
  }

  async publishAnnouncement(tenantId: string, announcementId: string) {
    const announcement = await prisma.announcement.findFirst({
      where: { id: announcementId, tenantId }
    });

    if (!announcement) {
      throw new Error('Announcement not found');
    }

    // Get target users based on audience criteria
    const users = await prisma.user.findMany({
      where: {
        tenants: {
          some: { tenantId }
        }
      }
    });

    // Create recipient records
    const recipients = users.map(user => ({
      announcementId,
      userId: user.id,
      tenantId,
      deliveryMethod: 'in_app'
    }));

    await prisma.announcementRecipient.createMany({
      data: recipients
    });

    // Update announcement as published
    await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        isPublished: true,
        publishedAt: new Date()
      }
    });
  }

  async getAnnouncements(tenantId: string, userId?: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isPublished: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    };

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          creator: true,
          recipients: userId ? {
            where: { userId }
          } : undefined,
          _count: {
            select: {
              recipients: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.announcement.count({ where })
    ]);

    return {
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markAnnouncementAsRead(tenantId: string, announcementId: string, userId: string) {
    await prisma.announcementRecipient.updateMany({
      where: {
        announcementId,
        userId,
        tenantId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }

  // Forums
  async createForum(tenantId: string, userId: string, data: CreateForumData) {
    const forum = await prisma.forum.create({
      data: {
        ...data,
        tenantId,
        createdBy: userId,
        moderators: {
          create: {
            userId,
            role: 'SUPER_ADMIN',
            tenantId
          }
        }
      },
      include: {
        creator: true,
        moderators: {
          include: {
            user: true
          }
        },
        _count: {
          select: {
            categories: true
          }
        }
      }
    });

    return forum;
  }

  async getForums(tenantId: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [forums, total] = await Promise.all([
      prisma.forum.findMany({
        where: {
          tenantId,
          isPublic: true
        },
        include: {
          creator: true,
          _count: {
            select: {
              categories: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.forum.count({
        where: {
          tenantId,
          isPublic: true
        }
      })
    ]);

    return {
      forums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createForumCategory(tenantId: string, forumId: string, userId: string, data: {
    name: string;
    description?: string;
    slug: string;
    sortOrder?: number;
  }) {
    // Check if user is moderator
    const moderator = await prisma.forumModerator.findFirst({
      where: {
        forumId,
        userId,
        tenantId
      }
    });

    if (!moderator) {
      throw new Error('Only forum moderators can create categories');
    }

    const category = await prisma.forumCategory.create({
      data: {
        ...data,
        forumId,
        tenantId
      },
      include: {
        forum: true,
        _count: {
          select: {
            topics: true
          }
        }
      }
    });

    return category;
  }

  async createForumTopic(tenantId: string, categoryId: string, userId: string, data: {
    title: string;
    content: string;
    contentType?: 'TEXT' | 'MARKDOWN' | 'HTML';
    tags?: string[];
  }) {
    const topic = await prisma.forumTopic.create({
      data: {
        ...data,
        categoryId,
        createdBy: userId,
        tenantId
      },
      include: {
        category: {
          include: {
            forum: true
          }
        },
        creator: true,
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    return topic;
  }

  async createForumPost(tenantId: string, topicId: string, userId: string, data: {
    content: string;
    contentType?: 'TEXT' | 'MARKDOWN' | 'HTML';
    parentId?: string;
  }) {
    const post = await prisma.forumPost.create({
      data: {
        ...data,
        topicId,
        createdBy: userId,
        tenantId
      },
      include: {
        topic: true,
        creator: true,
        parent: true,
        _count: {
          select: {
            replies: true
          }
        }
      }
    });

    return post;
  }

  async getForumTopics(tenantId: string, categoryId: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [topics, total] = await Promise.all([
      prisma.forumTopic.findMany({
        where: {
          categoryId,
          tenantId
        },
        include: {
          creator: true,
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: [
          { isSticky: 'desc' },
          { isPinned: 'desc' },
          { updatedAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.forumTopic.count({
        where: {
          categoryId,
          tenantId
        }
      })
    ]);

    return {
      topics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getForumPosts(tenantId: string, topicId: string, options: PaginationOptions = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Increment topic view count
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: {
        views: { increment: 1 }
      }
    });

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where: {
          topicId,
          tenantId,
          isDeleted: false
        },
        include: {
          creator: true,
          _count: {
            select: {
              replies: true
            }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.forumPost.count({
        where: {
          topicId,
          tenantId,
          isDeleted: false
        }
      })
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Analytics and Statistics
  async getCommunicationStats(tenantId: string, period: 'day' | 'week' | 'month' = 'week') {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const [
      totalChannels,
      activeChannels,
      totalMessages,
      totalDirectMessages,
      totalAnnouncements,
      totalForums,
      activeUsers
    ] = await Promise.all([
      prisma.communicationChannel.count({
        where: { tenantId, isArchived: false }
      }),
      prisma.communicationChannel.count({
        where: {
          tenantId,
          isArchived: false,
          messages: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      }),
      prisma.message.count({
        where: {
          tenantId,
          createdAt: { gte: startDate },
          isDeleted: false
        }
      }),
      prisma.directMessage.count({
        where: {
          tenantId,
          createdAt: { gte: startDate },
          isDeleted: false
        }
      }),
      prisma.announcement.count({
        where: {
          tenantId,
          publishedAt: { gte: startDate }
        }
      }),
      prisma.forum.count({
        where: { tenantId }
      }),
      prisma.channelMember.findMany({
        where: {
          tenantId,
          lastSeenAt: { gte: startDate }
        },
        distinct: ['userId']
      }).then(members => members.length)
    ]);

    return {
      period,
      startDate,
      endDate: now,
      channels: {
        total: totalChannels,
        active: activeChannels
      },
      messages: {
        total: totalMessages,
        direct: totalDirectMessages
      },
      announcements: totalAnnouncements,
      forums: totalForums,
      activeUsers
    };
  }
}