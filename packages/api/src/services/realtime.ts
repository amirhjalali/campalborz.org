import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

interface AuthenticatedSocket extends Socket {
  userId: string;
  tenantId: string;
  user: {
    id: string;
    name: string;
    email: string;
    tenantId: string;
    role: string;
  };
}

interface RealtimeEvent {
  type: string;
  payload: any;
  tenantId: string;
  userId?: string;
  timestamp: Date;
}

class RealtimeService {
  private io: SocketIOServer;
  private authenticatedSockets: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL 
          : ['http://localhost:3000', 'http://localhost:8081'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: {
            tenant: true
          }
        });

        if (!user || !user.tenant) {
          return next(new Error('Invalid token or user not found'));
        }

        (socket as AuthenticatedSocket).userId = user.id;
        (socket as AuthenticatedSocket).tenantId = user.tenantId;
        (socket as AuthenticatedSocket).user = {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role
        };

        next();
      } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const authSocket = socket as AuthenticatedSocket;
      
      logger.info(`User ${authSocket.user.name} connected to realtime`, {
        userId: authSocket.userId,
        tenantId: authSocket.tenantId,
        socketId: socket.id
      });

      this.authenticatedSockets.set(socket.id, authSocket);

      // Join tenant-specific room
      socket.join(`tenant:${authSocket.tenantId}`);
      
      // Join user-specific room
      socket.join(`user:${authSocket.userId}`);

      // Handle user presence
      this.handleUserPresence(authSocket, true);

      // Setup event listeners
      this.setupSocketEventListeners(authSocket);

      socket.on('disconnect', () => {
        logger.info(`User ${authSocket.user.name} disconnected from realtime`, {
          userId: authSocket.userId,
          tenantId: authSocket.tenantId,
          socketId: socket.id
        });

        this.authenticatedSockets.delete(socket.id);
        this.handleUserPresence(authSocket, false);
      });
    });
  }

  private setupSocketEventListeners(socket: AuthenticatedSocket) {
    // Chat message events
    socket.on('chat:join_room', (roomId: string) => {
      socket.join(`chat:${roomId}`);
      logger.info(`User ${socket.userId} joined chat room ${roomId}`);
    });

    socket.on('chat:leave_room', (roomId: string) => {
      socket.leave(`chat:${roomId}`);
      logger.info(`User ${socket.userId} left chat room ${roomId}`);
    });

    socket.on('chat:send_message', async (data: { roomId: string; message: string; type?: string }) => {
      try {
        // Validate user has access to this chat room
        const hasAccess = await this.validateChatAccess(socket.userId, data.roomId);
        if (!hasAccess) {
          socket.emit('error', { message: 'Access denied to chat room' });
          return;
        }

        const messageEvent: RealtimeEvent = {
          type: 'chat:new_message',
          payload: {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            roomId: data.roomId,
            message: data.message,
            type: data.type || 'text',
            user: socket.user,
            timestamp: new Date()
          },
          tenantId: socket.tenantId,
          userId: socket.userId,
          timestamp: new Date()
        };

        // Broadcast to chat room
        this.io.to(`chat:${data.roomId}`).emit('chat:new_message', messageEvent.payload);

        // Store in Redis for message history
        await this.storeChatMessage(data.roomId, messageEvent.payload);

        logger.info(`Chat message sent in room ${data.roomId}`, {
          userId: socket.userId,
          tenantId: socket.tenantId
        });
      } catch (error) {
        logger.error('Error sending chat message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Notification events
    socket.on('notifications:mark_read', async (notificationIds: string[]) => {
      try {
        await prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
            userId: socket.userId
          },
          data: { read: true, readAt: new Date() }
        });

        socket.emit('notifications:marked_read', { notificationIds });
        
        logger.info(`Marked ${notificationIds.length} notifications as read`, {
          userId: socket.userId,
          tenantId: socket.tenantId
        });
      } catch (error) {
        logger.error('Error marking notifications as read:', error);
        socket.emit('error', { message: 'Failed to mark notifications as read' });
      }
    });

    // Activity tracking
    socket.on('activity:update', (activity: { page: string; action: string; metadata?: any }) => {
      this.trackUserActivity(socket.userId, socket.tenantId, activity);
    });
  }

  private async handleUserPresence(socket: AuthenticatedSocket, isOnline: boolean) {
    try {
      const presenceKey = `presence:${socket.tenantId}`;
      
      if (isOnline) {
        await redis.hset(presenceKey, socket.userId, JSON.stringify({
          userId: socket.userId,
          name: socket.user.name,
          status: 'online',
          lastSeen: new Date().toISOString(),
          socketId: socket.id
        }));
      } else {
        await redis.hset(presenceKey, socket.userId, JSON.stringify({
          userId: socket.userId,
          name: socket.user.name,
          status: 'offline',
          lastSeen: new Date().toISOString()
        }));
      }

      // Broadcast presence update to tenant
      const presenceUpdate = {
        userId: socket.userId,
        name: socket.user.name,
        status: isOnline ? 'online' : 'offline',
        lastSeen: new Date()
      };

      this.io.to(`tenant:${socket.tenantId}`).emit('presence:update', presenceUpdate);

    } catch (error) {
      logger.error('Error updating user presence:', error);
    }
  }

  private async validateChatAccess(userId: string, roomId: string): Promise<boolean> {
    // Implement chat room access validation logic
    // This would check if the user has permission to access the chat room
    return true; // Simplified for now
  }

  private async storeChatMessage(roomId: string, message: any) {
    try {
      const messagesKey = `chat:messages:${roomId}`;
      await redis.lpush(messagesKey, JSON.stringify(message));
      await redis.ltrim(messagesKey, 0, 99); // Keep last 100 messages
      await redis.expire(messagesKey, 86400 * 7); // Expire after 7 days
    } catch (error) {
      logger.error('Error storing chat message:', error);
    }
  }

  private async trackUserActivity(userId: string, tenantId: string, activity: any) {
    try {
      const activityKey = `activity:${tenantId}:${userId}`;
      const activityData = {
        ...activity,
        timestamp: new Date().toISOString()
      };

      await redis.lpush(activityKey, JSON.stringify(activityData));
      await redis.ltrim(activityKey, 0, 49); // Keep last 50 activities
      await redis.expire(activityKey, 86400); // Expire after 1 day

    } catch (error) {
      logger.error('Error tracking user activity:', error);
    }
  }

  // Public methods for broadcasting events
  async broadcastToTenant(tenantId: string, event: string, payload: any) {
    this.io.to(`tenant:${tenantId}`).emit(event, payload);
    
    logger.info(`Broadcasted event ${event} to tenant ${tenantId}`, {
      tenantId,
      event,
      payloadKeys: Object.keys(payload)
    });
  }

  async broadcastToUser(userId: string, event: string, payload: any) {
    this.io.to(`user:${userId}`).emit(event, payload);
    
    logger.info(`Broadcasted event ${event} to user ${userId}`, {
      userId,
      event,
      payloadKeys: Object.keys(payload)
    });
  }

  async broadcastToRoom(roomId: string, event: string, payload: any) {
    this.io.to(roomId).emit(event, payload);
    
    logger.info(`Broadcasted event ${event} to room ${roomId}`, {
      roomId,
      event,
      payloadKeys: Object.keys(payload)
    });
  }

  async getOnlineUsers(tenantId: string): Promise<any[]> {
    try {
      const presenceKey = `presence:${tenantId}`;
      const presenceData = await redis.hgetall(presenceKey);
      
      return Object.values(presenceData)
        .map(data => JSON.parse(data))
        .filter(user => user.status === 'online');
    } catch (error) {
      logger.error('Error getting online users:', error);
      return [];
    }
  }

  async getChatHistory(roomId: string, limit: number = 50): Promise<any[]> {
    try {
      const messagesKey = `chat:messages:${roomId}`;
      const messages = await redis.lrange(messagesKey, 0, limit - 1);
      
      return messages.map(msg => JSON.parse(msg)).reverse();
    } catch (error) {
      logger.error('Error getting chat history:', error);
      return [];
    }
  }

  getConnectedSocketsCount(): number {
    return this.authenticatedSockets.size;
  }

  getServerInstance(): SocketIOServer {
    return this.io;
  }
}

export { RealtimeService, RealtimeEvent, AuthenticatedSocket };