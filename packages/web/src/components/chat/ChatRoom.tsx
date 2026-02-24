'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageCircle, Wifi, WifiOff, ChevronDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatRoom, ChatMessage } from '../../hooks/useChatRoom';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface ChatRoomProps {
  /** If true, renders as a floating widget in the corner */
  floating?: boolean;
  className?: string;
}

/**
 * Camp chat room component. Can be used inline or as a floating widget.
 */
export function ChatRoom({ floating = false, className }: ChatRoomProps) {
  const { user } = useAuth();
  const { messages, typingUsers, isConnected, error, sendMessage, startTyping, stopTyping } = useChatRoom(true);

  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(!floating);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const prevMessageCountRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      // Check if user is near bottom of scroll
      const container = messagesContainerRef.current;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom || !isOpen) {
          scrollToBottom();
        }
        if (!isOpen && messages.length > 0) {
          setHasNewMessage(true);
        }
      } else {
        scrollToBottom();
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom, isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasNewMessage(false);
      // Scroll to bottom on open
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, scrollToBottom]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
    stopTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    startTyping();

    // Auto stop typing after 2s of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  let currentDate = '';
  for (const msg of messages) {
    const dateStr = formatDate(msg.timestamp);
    if (dateStr !== currentDate) {
      currentDate = dateStr;
      groupedMessages.push({ date: dateStr, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  const chatContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-tan/20 dark:border-white/10 bg-white/80 dark:bg-sage-dark/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold text-ink dark:text-cream">Camp Chat</h3>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
              <Wifi className="h-3 w-3" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-ink-soft/50">
              <WifiOff className="h-3 w-3" />
              {error || 'Disconnected'}
            </span>
          )}
          {floating && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-ink-soft hover:text-ink dark:text-white/50 dark:hover:text-white transition-colors"
              aria-label="Minimize chat"
            >
              <Minus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageCircle className="h-10 w-10 text-ink-soft/20 dark:text-white/10 mb-3" />
            <p className="text-sm text-ink-soft dark:text-white/50">
              No messages yet
            </p>
            <p className="text-xs text-ink-soft/60 dark:text-white/30 mt-1">
              Start the conversation with your campmates
            </p>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-tan/20 dark:bg-white/10" />
                <span className="text-[10px] font-medium text-ink-soft/50 dark:text-white/30 uppercase tracking-wider">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-tan/20 dark:bg-white/10" />
              </div>

              {group.messages.map((msg, idx) => {
                const isOwn = msg.senderId === user?.id;
                const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                const isConsecutive = prevMsg?.senderId === msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col',
                      isOwn ? 'items-end' : 'items-start',
                      !isConsecutive && idx > 0 ? 'mt-3' : 'mt-0.5'
                    )}
                  >
                    {/* Sender name (only for first message in a group) */}
                    {!isOwn && !isConsecutive && (
                      <span className="text-[10px] font-medium text-gold ml-1 mb-0.5">
                        {msg.senderName}
                      </span>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-3 py-2 text-sm break-words',
                        isOwn
                          ? 'bg-gold text-white rounded-br-md'
                          : 'bg-cream dark:bg-white/10 text-ink dark:text-cream rounded-bl-md'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={cn(
                        'text-[9px] mt-0.5 block text-right',
                        isOwn ? 'text-white/60' : 'text-ink-soft/50 dark:text-white/30'
                      )}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center gap-2 mt-2"
            >
              <div className="flex gap-1 px-3 py-2 rounded-2xl bg-cream dark:bg-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-ink-soft/40 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-ink-soft/50 dark:text-white/30">
                {typingUsers.map((u) => u.userName).join(', ')}{' '}
                {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-tan/20 dark:border-white/10 bg-white/80 dark:bg-sage-dark/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 bg-cream dark:bg-white/10 border border-tan/30 dark:border-white/10 rounded-full text-sm text-ink dark:text-cream placeholder:text-ink-soft/50 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50"
            maxLength={2000}
          />
          <button
            onClick={handleSend}
            disabled={!isConnected || !input.trim()}
            className="p-2 rounded-full bg-gold text-white hover:bg-gold/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Floating widget mode
  if (floating) {
    return (
      <>
        {/* Floating toggle button */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gold text-white shadow-lg hover:bg-gold/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              aria-label="Open camp chat"
            >
              <MessageCircle className="h-6 w-6" />
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Floating chat panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'fixed bottom-6 right-6 z-40 w-80 sm:w-96 h-[500px] bg-white dark:bg-sage rounded-xl shadow-2xl border border-tan/30 dark:border-sage-light overflow-hidden flex flex-col',
                className
              )}
            >
              {chatContent}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Inline mode
  return (
    <div className={cn('luxury-card overflow-hidden h-[500px] flex flex-col', className)}>
      {chatContent}
    </div>
  );
}
