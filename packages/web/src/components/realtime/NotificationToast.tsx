'use client';

import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRealtime, type NotificationBroadcast } from '@/lib/realtime';
import { formatDistanceToNow } from 'date-fns';

interface Toast extends NotificationBroadcast {
  id: string;
  show: boolean;
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { client } = useRealtime();

  useEffect(() => {
    const handleNotification = (notification: NotificationBroadcast) => {
      const toast: Toast = {
        ...notification,
        id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        show: true
      };

      setToasts(prev => [...prev, toast]);

      // Auto-remove toast after 5 seconds for info/success, 8 seconds for warnings/errors
      const autoRemoveDelay = notification.type === 'info' || notification.type === 'success' ? 5000 : 8000;
      
      setTimeout(() => {
        removeToast(toast.id);
      }, autoRemoveDelay);
    };

    client.on('notification:broadcast', handleNotification);

    return () => {
      client.off('notification:broadcast', handleNotification);
    };
  }, [client]);

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== toastId));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full border rounded-lg shadow-lg p-4 
            transform transition-all duration-300 ease-in-out
            ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            ${getBackgroundColor(toast.type)}
          `}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(toast.type)}
            </div>
            <div className="ml-3 flex-1">
              <h4 className={`text-sm font-medium ${getTextColor(toast.type)}`}>
                {toast.title}
              </h4>
              <p className={`mt-1 text-sm ${getTextColor(toast.type)} opacity-90`}>
                {toast.message}
              </p>
              {toast.metadata && Object.keys(toast.metadata).length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  {Object.entries(toast.metadata).map(([key, value]) => (
                    <div key={key} className="truncate">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                {formatDistanceToNow(new Date(toast.timestamp), { addSuffix: true })}
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeToast(toast.id)}
                className="h-6 w-6 p-0 hover:bg-white/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}