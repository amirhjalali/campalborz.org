'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  announcement: { bg: 'bg-gold/10', text: 'text-gold', label: 'Announcement' },
  application_status: { bg: 'bg-green-50', text: 'text-green-700', label: 'Application' },
  event_reminder: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Event' },
  general: { bg: 'bg-sage/10', text: 'text-sage', label: 'Update' },
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-sage-dark dark:text-tan-light hover:bg-gold/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white text-[10px] font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-sage rounded-xl shadow-xl border border-tan/30 dark:border-sage-light overflow-hidden z-50"
            role="menu"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-tan/20 dark:border-white/10">
              <h3 className="text-sm font-semibold text-ink dark:text-cream">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors"
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-ink-soft hover:text-ink dark:text-white/50 dark:hover:text-white transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell className="h-8 w-8 mx-auto text-ink-soft/30 dark:text-white/20 mb-3" />
                  <p className="text-sm text-ink-soft dark:text-white/50">
                    No notifications yet
                  </p>
                  <p className="text-xs text-ink-soft/60 dark:text-white/30 mt-1">
                    You will be notified about announcements and updates.
                  </p>
                </div>
              ) : (
                <ul>
                  {notifications.map((notification) => {
                    const style = typeStyles[notification.type] || typeStyles.general;
                    return (
                      <li key={notification.id}>
                        <div
                          className={cn(
                            'px-4 py-3 hover:bg-cream/50 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-tan/10 dark:border-white/5 last:border-b-0',
                            !notification.read && 'bg-gold/[0.03] dark:bg-gold/[0.05]'
                          )}
                          onClick={() => markAsRead(notification.id)}
                          role="menuitem"
                        >
                          <div className="flex items-start gap-3">
                            {/* Unread indicator */}
                            <div className="pt-1.5 flex-shrink-0">
                              {!notification.read ? (
                                <div className="h-2 w-2 rounded-full bg-gold" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-transparent" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Type badge */}
                              <span className={cn('inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide mb-1', style.bg, style.text)}>
                                {style.label}
                              </span>

                              <p className="text-sm font-medium text-ink dark:text-cream truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-ink-soft dark:text-white/60 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-ink-soft/60 dark:text-white/30">
                                  {timeAgo(notification.timestamp)}
                                </span>
                                {notification.link && (
                                  <Link
                                    href={notification.link}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                      setIsOpen(false);
                                    }}
                                    className="flex items-center gap-0.5 text-[10px] text-gold hover:text-gold/80 transition-colors"
                                  >
                                    View
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </Link>
                                )}
                              </div>
                            </div>

                            {/* Read button */}
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="flex-shrink-0 p-1 text-ink-soft/40 hover:text-gold transition-colors"
                                aria-label="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
