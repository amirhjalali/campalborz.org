'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type SocketInstance = ReturnType<typeof io>;

export interface NewApplicationEvent {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

export interface ApplicationReviewedEvent {
  id: string;
  name: string;
  status: string;
  reviewedBy: string;
}

interface UseAdminLiveUpdatesReturn {
  isConnected: boolean;
  newApplications: NewApplicationEvent[];
  reviewedApplications: ApplicationReviewedEvent[];
  clearNewApplications: () => void;
  clearReviewedApplications: () => void;
}

/**
 * Hook for real-time admin dashboard updates.
 * Connects to the /admin namespace (requires ADMIN or MANAGER role).
 */
export function useAdminLiveUpdates(enabled: boolean = true): UseAdminLiveUpdatesReturn {
  const socketRef = useRef<SocketInstance | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newApplications, setNewApplications] = useState<NewApplicationEvent[]>([]);
  const [reviewedApplications, setReviewedApplications] = useState<ApplicationReviewedEvent[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const socket = io(`${API_BASE_URL}/admin`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // New application submitted
    socket.on('new_application', (data: NewApplicationEvent) => {
      setNewApplications((prev) => [data, ...prev].slice(0, 20));
    });

    // Application reviewed by another admin
    socket.on('application_reviewed', (data: ApplicationReviewedEvent) => {
      setReviewedApplications((prev) => [data, ...prev].slice(0, 20));
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const clearNewApplications = useCallback(() => {
    setNewApplications([]);
  }, []);

  const clearReviewedApplications = useCallback(() => {
    setReviewedApplications([]);
  }, []);

  return {
    isConnected,
    newApplications,
    reviewedApplications,
    clearNewApplications,
    clearReviewedApplications,
  };
}
