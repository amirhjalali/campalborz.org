'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, type ChatMessage } from '@/lib/realtime';
import { useAuthStore } from '@/stores/auth';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  onlineUsers?: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline';
  }>;
}

export function ChatRoom({ roomId, roomName, onlineUsers = [] }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { joinRoom, leaveRoom, sendMessage, isConnected } = useChat(roomId);

  useEffect(() => {
    // Join the chat room when component mounts
    joinRoom(roomId);

    // Load chat history
    loadChatHistory();

    return () => {
      // Leave the chat room when component unmounts
      leaveRoom(roomId);
    };
  }, [roomId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      // This would typically be a tRPC call to get chat history
      // const history = await trpc.realtime.getChatHistory.query({ roomId });
      // setMessages(history.messages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;

    const message = newMessage.trim();
    setNewMessage('');
    
    // Optimistically add message to UI
    const optimisticMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      roomId,
      message,
      type: 'text',
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email
      },
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Send message via WebSocket
    sendMessage(message);
  };

  const formatMessageTime = (timestamp: Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">{roomName}</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          {onlineUsers.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              <span>{onlineUsers.filter(u => u.status === 'online').length} online</span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user.id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    message.user.id === user?.id
                      ? 'flex-row-reverse'
                      : 'flex-row'
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={`https://avatar.vercel.sh/${message.user.email}`} />
                    <AvatarFallback className="text-xs">
                      {getInitials(message.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div
                    className={`mx-2 ${
                      message.user.id === user?.id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-lg ${
                        message.user.id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        {message.user.id !== user?.id && (
                          <span className="mr-2">{message.user.name}</span>
                        )}
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1"
            maxLength={1000}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Online Users Sidebar (Optional) */}
      {onlineUsers.length > 0 && (
        <div className="hidden lg:block w-48 border-l bg-gray-50 p-4">
          <h4 className="font-medium text-gray-900 mb-3">Online Now</h4>
          <div className="space-y-2">
            {onlineUsers
              .filter(user => user.status === 'online')
              .map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <div className="relative">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <span className="text-sm text-gray-700 truncate">{user.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}