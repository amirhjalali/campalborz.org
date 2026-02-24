'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

type SocketInstance = ReturnType<typeof io>;

export interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderId: string;
  timestamp: string;
}

interface TypingUser {
  userId: string;
  userName: string;
}

interface UseChatRoomReturn {
  messages: ChatMessage[];
  typingUsers: TypingUser[];
  isConnected: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
  startTyping: () => void;
  stopTyping: () => void;
}

/**
 * Hook for managing a real-time camp chat room.
 * Connects to the /chat namespace and manages message history, sending, and typing indicators.
 */
export function useChatRoom(enabled: boolean = true): UseChatRoomReturn {
  const socketRef = useRef<SocketInstance | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track typing timeout to auto-clear stale typing indicators
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!enabled) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setError('No authentication token');
      return;
    }

    const socket = io(`${API_BASE_URL}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setIsConnected(false);
    });

    // Receive chat history on connection
    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    // Receive new messages
    socket.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Typing indicators
    socket.on('user_typing', (user: TypingUser) => {
      setTypingUsers((prev) => {
        if (prev.some((u) => u.userId === user.userId)) return prev;
        return [...prev, user];
      });

      // Auto-clear after 4 seconds in case stop event is missed
      const existing = typingTimeoutsRef.current.get(user.userId);
      if (existing) clearTimeout(existing);
      typingTimeoutsRef.current.set(
        user.userId,
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u.userId !== user.userId));
          typingTimeoutsRef.current.delete(user.userId);
        }, 4000)
      );
    });

    socket.on('user_stopped_typing', ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      const timeout = typingTimeoutsRef.current.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        typingTimeoutsRef.current.delete(userId);
      }
    });

    socketRef.current = socket;

    return () => {
      // Clear all typing timeouts
      typingTimeoutsRef.current.forEach((t) => clearTimeout(t));
      typingTimeoutsRef.current.clear();

      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current?.connected) return;
    if (!text.trim()) return;
    socketRef.current.emit('send_message', { text: text.trim() });
  }, []);

  const startTyping = useCallback(() => {
    socketRef.current?.emit('typing_start');
  }, []);

  const stopTyping = useCallback(() => {
    socketRef.current?.emit('typing_stop');
  }, []);

  return {
    messages,
    typingUsers,
    isConnected,
    error,
    sendMessage,
    startTyping,
    stopTyping,
  };
}
