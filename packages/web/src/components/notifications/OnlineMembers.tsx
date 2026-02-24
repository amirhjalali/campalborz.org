'use client';

import { Users, Wifi, WifiOff } from 'lucide-react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { cn } from '../../lib/utils';

interface OnlineMembersProps {
  /** Compact mode shows just the count inline */
  compact?: boolean;
  className?: string;
}

/**
 * Displays the list of currently online camp members.
 * Uses the NotificationContext which tracks presence via the /notifications namespace.
 */
export function OnlineMembers({ compact = false, className }: OnlineMembersProps) {
  const { onlineUsers, isConnected } = useNotificationContext();

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-sm', className)}>
        {isConnected ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-ink-soft dark:text-white/60">
              {onlineUsers.length} online
            </span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-ink-soft/40" />
            <span className="text-ink-soft/40 dark:text-white/30">Offline</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('luxury-card p-5', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-gold" />
        <h3 className="text-sm font-semibold text-ink dark:text-cream">Online Members</h3>
        {isConnected ? (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <Wifi className="h-3 w-3" />
            Connected
          </span>
        ) : (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-ink-soft/50">
            <WifiOff className="h-3 w-3" />
            Disconnected
          </span>
        )}
      </div>

      {onlineUsers.length === 0 ? (
        <p className="text-xs text-ink-soft dark:text-white/50 text-center py-4">
          No members online right now
        </p>
      ) : (
        <ul className="space-y-2">
          {onlineUsers.map((user) => (
            <li key={user.id} className="flex items-center gap-3">
              {/* Avatar placeholder */}
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-sage/20 border border-gold/30 flex items-center justify-center">
                  <span className="text-xs font-medium text-gold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-sage" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink dark:text-cream truncate">
                  {user.name}
                </p>
                {user.role !== 'MEMBER' && (
                  <p className="text-[10px] text-gold uppercase tracking-wider">
                    {user.role}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
