'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import io from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type SocketInstance = ReturnType<typeof io>;

export interface Notification {
  id: string;
  type: 'announcement' | 'application_status' | 'event_reminder' | 'general';
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  read: boolean;
}

export interface OnlineUser {
  id: string;
  name: string;
  role: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  onlineUsers: OnlineUser[];
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

/**
 * Hook for receiving real-time push notifications and online member tracking.
 * Connects to the /notifications namespace when a valid token is present.
 */
export function useNotifications(enabled: boolean = true): UseNotificationsReturn {
  const socketRef = useRef<SocketInstance | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const socket = io(`${API_BASE_URL}/notifications`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      // Request current online users list
      socket.emit('get_online_users');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Receive push notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
    });

    // Receive online users list updates
    socket.on('online_users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    socketRef.current?.emit('mark_read', id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    onlineUsers,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
