'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Toast Types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * Toast Interface
 */
export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast Context
 */
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string;
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string;
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string;
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider
 */
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
  defaultDuration?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast = { ...toast, id };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto remove after duration
    const duration = toast.duration ?? defaultDuration;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [maxToasts, defaultDuration]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ type: 'error', message, ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      {isMounted && createPortal(
        <div className={cn('fixed z-[9999] flex flex-col gap-2', positionClasses[position])}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

/**
 * Toast Item Component
 */
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-900',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-900',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-900',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-900',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    },
  };

  const styles = typeStyles[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 min-w-[320px] max-w-md p-4 border rounded-lg shadow-lg',
        'transition-all duration-300',
        styles.bg,
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      )}
    >
      {styles.icon}

      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className={cn('font-semibold mb-1', styles.text)}>
            {toast.title}
          </div>
        )}
        <div className={cn('text-sm', styles.text)}>
          {toast.message}
        </div>

        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleClose();
            }}
            className={cn(
              'text-sm font-medium mt-2 underline hover:no-underline',
              styles.text
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className={cn('flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors')}
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

/**
 * useToast Hook
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

/**
 * Snackbar Component (bottom-aligned toast)
 */
export interface SnackbarProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose?: () => void;
}

export function Snackbar({
  message,
  action,
  duration = 5000,
  onClose,
}: SnackbarProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]',
        'flex items-center gap-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg',
        'transition-all duration-300',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <span className="text-sm">{message}</span>

      {action && (
        <button
          onClick={() => {
            action.onClick();
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="text-sm font-medium text-primary-400 hover:text-primary-300 uppercase"
        >
          {action.label}
        </button>
      )}

      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
        }}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

/**
 * Standalone toast function (for use outside React components)
 */
let toastQueue: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function setToastQueue(addToast: (toast: Omit<Toast, 'id'>) => void) {
  toastQueue = addToast;
}

export const toast = {
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    toastQueue?.({ type: 'success', message, ...options });
  },
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    toastQueue?.({ type: 'error', message, ...options });
  },
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    toastQueue?.({ type: 'warning', message, ...options });
  },
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'message'>>) => {
    toastQueue?.({ type: 'info', message, ...options });
  },
};

/**
 * Example Usage
 */
export function ToastExample() {
  const { success, error, warning, info } = useToast();
  const [showSnackbar, setShowSnackbar] = useState(false);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => success('Operation completed successfully!')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Show Success
          </button>

          <button
            onClick={() => error('An error occurred. Please try again.')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Show Error
          </button>

          <button
            onClick={() => warning('This action cannot be undone.')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Show Warning
          </button>

          <button
            onClick={() => info('New features are now available.')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Show Info
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Toast with Title</h2>
        <button
          onClick={() => success('Changes have been saved successfully.', {
            title: 'Success',
          })}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Show Toast with Title
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Toast with Action</h2>
        <button
          onClick={() => success('File uploaded successfully.', {
            title: 'Upload Complete',
            action: {
              label: 'View File',
              onClick: () => console.log('View file clicked'),
            },
          })}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Show Toast with Action
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Toast with Custom Duration</h2>
        <button
          onClick={() => info('This toast will disappear in 10 seconds.', {
            duration: 10000,
          })}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Show Long Toast (10s)
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Persistent Toast</h2>
        <button
          onClick={() => warning('This toast will stay until you close it.', {
            duration: 0, // 0 means no auto-dismiss
          })}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Show Persistent Toast
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Snackbar</h2>
        <button
          onClick={() => setShowSnackbar(true)}
          className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          Show Snackbar
        </button>

        {showSnackbar && (
          <Snackbar
            message="Item added to cart"
            action={{
              label: 'Undo',
              onClick: () => console.log('Undo clicked'),
            }}
            duration={5000}
            onClose={() => setShowSnackbar(false)}
          />
        )}
      </div>
    </div>
  );
}
