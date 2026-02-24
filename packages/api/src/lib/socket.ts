import { Server as HttpServer } from 'http';
import { Server, Socket, Namespace } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import logger from './logger';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

interface AuthPayload {
  userId: string;
  role: string;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userName?: string;
  userRole?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  timestamp: string;
}

// ------------------------------------------------------------------
// In-memory stores (swap for Redis in production if needed)
// ------------------------------------------------------------------

const onlineUsers = new Map<string, { name: string; role: string; socketId: string }>();
const chatHistory: ChatMessage[] = [];
const MAX_CHAT_HISTORY = 200;

// ------------------------------------------------------------------
// Helper: authenticate a socket connection via JWT
// ------------------------------------------------------------------

async function authenticateSocket(socket: Socket): Promise<{ userId: string; name: string; role: string } | null> {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;

    const member = await prisma.member.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, role: true, isActive: true },
    });

    if (!member || !member.isActive) return null;

    return { userId: member.id, name: member.name, role: member.role };
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Middleware: require authentication for a namespace
// ------------------------------------------------------------------

function requireAuth(namespace: Namespace) {
  namespace.use(async (socket: AuthenticatedSocket, next) => {
    const user = await authenticateSocket(socket);
    if (!user) {
      return next(new Error('Authentication required'));
    }
    socket.userId = user.userId;
    socket.userName = user.name;
    socket.userRole = user.role;
    next();
  });
}

// ------------------------------------------------------------------
// Middleware: require admin/manager role
// ------------------------------------------------------------------

function requireAdmin(namespace: Namespace) {
  requireAuth(namespace);
  namespace.use((socket: AuthenticatedSocket, next) => {
    if (socket.userRole !== 'ADMIN' && socket.userRole !== 'MANAGER') {
      return next(new Error('Admin access required'));
    }
    next();
  });
}

// ------------------------------------------------------------------
// Main initializer
// ------------------------------------------------------------------

let io: Server;

export function getIO(): Server {
  return io;
}

export function initializeSocket(httpServer: HttpServer): Server {
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? ['https://campalborz.org', 'https://www.campalborz.org']
      : ['http://localhost:3006', 'http://localhost:3000'];

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // ----------------------------------------------------------------
  // /notifications namespace  --  push notifications to members
  // ----------------------------------------------------------------

  const notificationsNs = io.of('/notifications');
  requireAuth(notificationsNs);

  notificationsNs.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`[notifications] ${socket.userName} connected (${socket.userId})`);

    // Join a personal room so we can target individuals
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Track online users globally
    if (socket.userId && socket.userName && socket.userRole) {
      onlineUsers.set(socket.userId, {
        name: socket.userName,
        role: socket.userRole,
        socketId: socket.id,
      });

      // Broadcast updated online list to all connected members
      notificationsNs.emit('online_users', getOnlineUsersList());
    }

    // Client can request the current online list
    socket.on('get_online_users', () => {
      socket.emit('online_users', getOnlineUsersList());
    });

    // Mark a notification as read (client-side convenience event)
    socket.on('mark_read', (notificationId: string) => {
      logger.debug(`[notifications] ${socket.userName} marked ${notificationId} as read`);
      // In a full implementation this would update the DB
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        notificationsNs.emit('online_users', getOnlineUsersList());
      }
      logger.info(`[notifications] ${socket.userName} disconnected`);
    });
  });

  // ----------------------------------------------------------------
  // /chat namespace  --  camp chat room
  // ----------------------------------------------------------------

  const chatNs = io.of('/chat');
  requireAuth(chatNs);

  chatNs.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`[chat] ${socket.userName} connected`);

    // Send recent chat history to the newly connected client
    socket.emit('chat_history', chatHistory.slice(-50));

    // Listen for new messages
    socket.on('send_message', (data: { text: string }) => {
      if (!data.text || data.text.trim().length === 0) return;
      if (data.text.length > 2000) return; // basic length guard

      const message: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: data.text.trim(),
        senderName: socket.userName || 'Unknown',
        senderId: socket.userId || '',
        timestamp: new Date().toISOString(),
      };

      chatHistory.push(message);
      if (chatHistory.length > MAX_CHAT_HISTORY) {
        chatHistory.splice(0, chatHistory.length - MAX_CHAT_HISTORY);
      }

      chatNs.emit('new_message', message);
    });

    // Typing indicator
    socket.on('typing_start', () => {
      socket.broadcast.emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
      });
    });

    socket.on('typing_stop', () => {
      socket.broadcast.emit('user_stopped_typing', {
        userId: socket.userId,
      });
    });

    socket.on('disconnect', () => {
      logger.info(`[chat] ${socket.userName} disconnected`);
    });
  });

  // ----------------------------------------------------------------
  // /admin namespace  --  real-time admin dashboard updates
  // ----------------------------------------------------------------

  const adminNs = io.of('/admin');
  requireAdmin(adminNs);

  adminNs.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`[admin] ${socket.userName} connected`);

    socket.on('disconnect', () => {
      logger.info(`[admin] ${socket.userName} disconnected`);
    });
  });

  logger.info('Socket.io initialized with namespaces: /notifications, /chat, /admin');
  return io;
}

// ------------------------------------------------------------------
// Public helpers to emit events from tRPC routes / services
// ------------------------------------------------------------------

/** Send a notification to a specific user */
export function notifyUser(userId: string, notification: {
  id: string;
  type: 'announcement' | 'application_status' | 'event_reminder' | 'general';
  title: string;
  message: string;
  link?: string;
}) {
  if (!io) return;
  io.of('/notifications').to(`user:${userId}`).emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
    read: false,
  });
}

/** Broadcast a notification to all connected members */
export function notifyAll(notification: {
  id: string;
  type: 'announcement' | 'application_status' | 'event_reminder' | 'general';
  title: string;
  message: string;
  link?: string;
}) {
  if (!io) return;
  io.of('/notifications').emit('notification', {
    ...notification,
    timestamp: new Date().toISOString(),
    read: false,
  });
}

/** Push a live update to admin dashboards */
export function emitAdminUpdate(event: string, data: unknown) {
  if (!io) return;
  io.of('/admin').emit(event, data);
}

/** Get the list of currently online users */
function getOnlineUsersList() {
  return Array.from(onlineUsers.entries()).map(([id, info]) => ({
    id,
    name: info.name,
    role: info.role,
  }));
}
