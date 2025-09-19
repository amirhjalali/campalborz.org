'use client';

import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtime, type PresenceUpdate } from '@/lib/realtime';
import { formatDistanceToNow } from 'date-fns';

interface OnlineUser {
  userId: string;
  name: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  avatar?: string;
}

interface PresenceIndicatorProps {
  showUserList?: boolean;
  maxVisibleUsers?: number;
  className?: string;
}

export function PresenceIndicator({ 
  showUserList = true, 
  maxVisibleUsers = 5,
  className = "" 
}: PresenceIndicatorProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { client } = useRealtime();

  useEffect(() => {
    const handleConnection = () => {
      setIsConnected(true);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
    };

    const handlePresenceUpdate = (update: PresenceUpdate) => {
      setOnlineUsers(prev => {
        const existingIndex = prev.findIndex(user => user.userId === update.userId);
        
        if (existingIndex >= 0) {
          // Update existing user
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: update.status,
            lastSeen: new Date(update.lastSeen)
          };
          
          // Remove offline users after 5 minutes
          if (update.status === 'offline') {
            setTimeout(() => {
              setOnlineUsers(current => 
                current.filter(user => user.userId !== update.userId)
              );
            }, 5 * 60 * 1000);
          }
          
          return updated;
        } else if (update.status === 'online') {
          // Add new online user
          return [...prev, {
            userId: update.userId,
            name: update.name,
            status: update.status,
            lastSeen: new Date(update.lastSeen)
          }];
        }
        
        return prev;
      });
    };

    client.on('connected', handleConnection);
    client.on('disconnected', handleDisconnection);
    client.on('presence:update', handlePresenceUpdate);

    // Set initial connection state
    setIsConnected(client.isConnected());

    return () => {
      client.off('connected', handleConnection);
      client.off('disconnected', handleDisconnection);
      client.off('presence:update', handlePresenceUpdate);
    };
  }, [client]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const onlineCount = onlineUsers.filter(user => user.status === 'online').length;
  const visibleUsers = onlineUsers
    .filter(user => user.status === 'online')
    .slice(0, maxVisibleUsers);
  const hiddenCount = Math.max(0, onlineCount - maxVisibleUsers);

  return (
    <TooltipProvider>
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* Connection Status */}
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isConnected ? 'Connected to realtime' : 'Disconnected from realtime'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Online Users Count */}
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{onlineCount}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{onlineCount} user{onlineCount !== 1 ? 's' : ''} online</p>
          </TooltipContent>
        </Tooltip>

        {/* User Avatars */}
        {showUserList && onlineCount > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex -space-x-2">
              {visibleUsers.map((user) => (
                <Tooltip key={user.userId}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-white hover:z-10 transition-transform hover:scale-110">
                        <AvatarImage 
                          src={user.avatar || `https://avatar.vercel.sh/${user.name}`} 
                          alt={user.name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.status === 'online' ? 'Online now' : (
                          `Last seen ${formatDistanceToNow(user.lastSeen, { addSuffix: true })}`
                        )}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              
              {/* Hidden users count */}
              {hiddenCount > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        +{hiddenCount}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{hiddenCount} more user{hiddenCount !== 1 ? 's' : ''} online</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}