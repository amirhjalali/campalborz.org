import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';

interface RealtimeEvent {
  type: string;
  payload: any;
  tenantId: string;
  userId?: string;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  roomId: string;
  message: string;
  type: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: Date;
}

interface PresenceUpdate {
  userId: string;
  name: string;
  status: 'online' | 'offline';
  lastSeen: Date;
}

interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  message: string;
  type: 'text' | 'system' | 'notification';
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface NotificationBroadcast {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId: string;
}

class RealtimeClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const { token } = useAuthStore.getState();
    
    if (!token) {
      console.warn('No auth token available for realtime connection');
      return;
    }

    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'wss://api.campalborz.org'
      : 'ws://localhost:3001';

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to realtime server');
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from realtime server:', reason);
      this.emit('disconnected', { reason });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }
      
      this.handleReconnection();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection_error', { error: error.message });
      this.handleReconnection();
    });

    // Chat events
    this.socket.on('chat:new_message', (message: ChatMessage) => {
      this.emit('chat:new_message', message);
    });

    // Presence events
    this.socket.on('presence:update', (update: PresenceUpdate) => {
      this.emit('presence:update', update);
    });

    // Notification events
    this.socket.on('notification:broadcast', (notification: NotificationBroadcast) => {
      this.emit('notification:broadcast', notification);
    });

    this.socket.on('notification:role_broadcast', (notification: NotificationBroadcast & { targetRole?: string }) => {
      const { user } = useAuthStore.getState();
      if (user && user.role === notification.targetRole) {
        this.emit('notification:broadcast', notification);
      }
    });

    // Direct message events
    this.socket.on('message:direct', (message: DirectMessage) => {
      this.emit('message:direct', message);
    });

    this.socket.on('message:sent', (confirmation: { messageId: string; recipientId: string }) => {
      this.emit('message:sent', confirmation);
    });

    // Event update events
    this.socket.on('event:update', (eventUpdate: any) => {
      this.emit('event:update', eventUpdate);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Public API methods
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  // Chat methods
  joinChatRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:join_room', roomId);
    }
  }

  leaveChatRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('chat:leave_room', roomId);
    }
  }

  sendChatMessage(roomId: string, message: string, type: string = 'text') {
    if (this.socket?.connected) {
      this.socket.emit('chat:send_message', { roomId, message, type });
    }
  }

  // Notification methods
  markNotificationsRead(notificationIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('notifications:mark_read', notificationIds);
    }
  }

  // Activity tracking
  trackActivity(activity: { page: string; action: string; metadata?: any }) {
    if (this.socket?.connected) {
      this.socket.emit('activity:update', activity);
    }
  }

  // Connection management
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  updateToken(newToken: string) {
    if (this.socket) {
      this.socket.auth = { token: newToken };
      this.reconnect();
    }
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: this.socket?.io.engine?.transport?.name
    };
  }
}

// Create singleton instance
const realtimeClient = new RealtimeClient();

// React hooks for easier integration
export const useRealtime = () => {
  return {
    client: realtimeClient,
    isConnected: realtimeClient.isConnected(),
    connectionInfo: realtimeClient.getConnectionInfo()
  };
};

export const useChat = (roomId?: string) => {
  const joinRoom = (id: string) => realtimeClient.joinChatRoom(id);
  const leaveRoom = (id: string) => realtimeClient.leaveChatRoom(id);
  const sendMessage = (message: string, type?: string) => {
    if (roomId) {
      realtimeClient.sendChatMessage(roomId, message, type);
    }
  };

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    isConnected: realtimeClient.isConnected()
  };
};

export const usePresence = () => {
  return {
    trackActivity: realtimeClient.trackActivity.bind(realtimeClient),
    isConnected: realtimeClient.isConnected()
  };
};

export { realtimeClient };
export type { 
  RealtimeEvent, 
  ChatMessage, 
  PresenceUpdate, 
  DirectMessage, 
  NotificationBroadcast 
};