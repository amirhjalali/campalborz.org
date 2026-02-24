import io from 'socket.io-client';
import { getAuthToken } from './auth';

/**
 * Socket instance type. Uses ReturnType<typeof io> to match the actual
 * return type of the io() function, avoiding conflicts between the
 * modern socket.io-client package types and the legacy @types/socket.io-client.
 */
type SocketInstance = ReturnType<typeof io>;

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

interface NotificationBroadcast {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  userId: string;
}

class MobileRealtimeClient {
  private socket: SocketInstance | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<Function>> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    await this.connect();
    this.isInitialized = true;
  }

  private async connect() {
    const token = await getAuthToken();

    if (!token) {
      console.warn('No auth token available for realtime connection');
      return;
    }

    const serverUrl =
      process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      forceNew: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Mobile connected to realtime server');
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Mobile disconnected from realtime server:', reason);
      this.emit('disconnected', { reason });

      if (reason === 'io server disconnect') {
        return;
      }

      this.handleReconnection();
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Mobile connection error:', error);
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
    this.socket.on(
      'notification:broadcast',
      (notification: NotificationBroadcast) => {
        this.emit('notification:broadcast', notification);
      },
    );

    // Event update events
    this.socket.on('event:update', (eventUpdate: any) => {
      this.emit('event:update', eventUpdate);
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('Mobile socket error:', error);
      this.emit('error', error);
    });
  }

  private async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached', {});
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`,
    );

    setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  // Event handling
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
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(
            `Error in mobile event handler for ${event}:`,
            error,
          );
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
  trackActivity(activity: {
    page: string;
    action: string;
    metadata?: any;
  }) {
    if (this.socket?.connected) {
      this.socket.emit('activity:update', activity);
    }
  }

  // Connection management
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  async disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isInitialized = false;
  }

  async reconnect() {
    await this.disconnect();
    this.reconnectAttempts = 0;
    await this.connect();
  }

  async updateToken() {
    if (this.socket) {
      const newToken = await getAuthToken();
      if (newToken) {
        (this.socket as any).auth = { token: newToken };
        await this.reconnect();
      }
    }
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
      transport: (this.socket?.io as any)?.engine?.transport?.name,
      initialized: this.isInitialized,
    };
  }

  // Background handling for React Native
  async handleAppStateChange(nextAppState: string) {
    if (nextAppState === 'active') {
      // App became active
      if (!this.isConnected() && this.isInitialized) {
        await this.reconnect();
      }
    } else if (nextAppState === 'background') {
      // App went to background - keep connection but reduce activity
      this.trackActivity({
        page: 'background',
        action: 'app_backgrounded',
        metadata: { timestamp: new Date().toISOString() },
      });
    }
  }

  // Push notification integration
  registerForPushNotifications(pushToken: string) {
    if (this.socket?.connected) {
      this.socket.emit('push:register_token', {
        token: pushToken,
        platform: 'mobile',
        deviceInfo: {
          // Add device info if needed
        },
      });
    }
  }

  unregisterPushNotifications() {
    if (this.socket?.connected) {
      this.socket.emit('push:unregister_token');
    }
  }
}

// Create singleton instance
const mobileRealtimeClient = new MobileRealtimeClient();

// React Native specific hooks would go here
export const useMobileRealtime = () => {
  return {
    client: mobileRealtimeClient,
    initialize: mobileRealtimeClient.initialize.bind(mobileRealtimeClient),
    isConnected: mobileRealtimeClient.isConnected(),
    connectionInfo: mobileRealtimeClient.getConnectionInfo(),
  };
};

export const useMobileChat = (roomId?: string) => {
  const joinRoom = (id: string) => mobileRealtimeClient.joinChatRoom(id);
  const leaveRoom = (id: string) => mobileRealtimeClient.leaveChatRoom(id);
  const sendMessage = (message: string, type?: string) => {
    if (roomId) {
      mobileRealtimeClient.sendChatMessage(roomId, message, type);
    }
  };

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    isConnected: mobileRealtimeClient.isConnected(),
  };
};

export const useMobilePresence = () => {
  return {
    trackActivity:
      mobileRealtimeClient.trackActivity.bind(mobileRealtimeClient),
    isConnected: mobileRealtimeClient.isConnected(),
  };
};

export { mobileRealtimeClient };
export type {
  RealtimeEvent,
  ChatMessage,
  PresenceUpdate,
  NotificationBroadcast,
};
