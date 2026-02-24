'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications, Notification, OnlineUser } from '../hooks/useNotifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  onlineUsers: OnlineUser[];
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

/**
 * Provider that wraps the useNotifications hook and makes it available
 * throughout the component tree. Only connects when the user is authenticated.
 */
export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isAuthenticated } = useAuth();

  const {
    notifications,
    unreadCount,
    onlineUsers,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications(isAuthenticated);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        onlineUsers,
        isConnected,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
