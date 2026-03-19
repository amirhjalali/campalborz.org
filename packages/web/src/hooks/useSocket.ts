'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketInstance = any;

interface UseSocketOptions {
  /** Socket.io namespace (e.g. '/chat', '/notifications', '/admin') */
  namespace: string;
  /** Whether to connect automatically. Defaults to true. */
  autoConnect?: boolean;
  /** If true, connection is skipped entirely. */
  disabled?: boolean;
}

interface UseSocketReturn {
  socket: SocketInstance | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Low-level hook that manages a Socket.io connection to a specific namespace.
 * Reads the JWT from localStorage and passes it as auth.
 *
 * socket.io-client is lazy-loaded via dynamic import to avoid bundling it
 * on pages that never use websockets.
 */
export function useSocket({ namespace, autoConnect = true, disabled = false }: UseSocketOptions): UseSocketReturn {
  const socketRef = useRef<SocketInstance | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return;
    if (!namespace) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setError('No authentication token');
      return;
    }

    // Lazy-load socket.io-client only when actually connecting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await (import('socket.io-client') as Promise<any>);
    const io = mod.default || mod;

    const socket = io(`${API_BASE_URL}${namespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err: Error) => {
      setError(err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;
  }, [namespace]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setError(null);
    }
  }, []);

  // Auto-connect on mount if autoConnect is true
  useEffect(() => {
    if (disabled) return;
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, disabled, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
  };
}
