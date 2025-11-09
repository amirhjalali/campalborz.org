'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Notification Banner
 *
 * Top banner for announcements and alerts
 */
interface BannerProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export function Banner({
  variant = 'info',
  title,
  message,
  dismissible = true,
  action,
  onDismiss,
}: BannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('border-b', styles.bg, styles.border)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {styles.icon}
            <div className="flex-1">
              {title && (
                <p className={cn('font-medium', styles.text)}>{title}</p>
              )}
              <p className={cn('text-sm', !title && 'font-medium', styles.text)}>
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  variant === 'info' && 'bg-blue-600 text-white hover:bg-blue-700',
                  variant === 'success' && 'bg-green-600 text-white hover:bg-green-700',
                  variant === 'warning' && 'bg-yellow-600 text-white hover:bg-yellow-700',
                  variant === 'error' && 'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                {action.label}
              </button>
            )}

            {dismissible && (
              <button
                onClick={handleDismiss}
                className={cn('p-1 rounded-md transition-colors', styles.text, 'hover:bg-black/5')}
                aria-label="Dismiss"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Badge
 *
 * Small indicator for counts and labels
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    outline: 'border-2 border-gray-300 text-gray-700 bg-transparent',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-2 h-2 rounded-full',
          variant === 'primary' && 'bg-primary-600',
          variant === 'success' && 'bg-green-600',
          variant === 'warning' && 'bg-yellow-600',
          variant === 'error' && 'bg-red-600',
          variant === 'default' && 'bg-gray-600',
          variant === 'outline' && 'bg-gray-600'
        )} />
      )}
      {children}
    </span>
  );
}

/**
 * Notification Badge (for icons)
 */
interface NotificationBadgeProps {
  count?: number;
  show?: boolean;
  max?: number;
  children: React.ReactNode;
  className?: string;
}

export function NotificationBadge({
  count,
  show = true,
  max = 99,
  children,
  className,
}: NotificationBadgeProps) {
  if (!show) return <>{children}</>;

  const displayCount = count !== undefined && count > max ? `${max}+` : count;

  return (
    <div className={cn('relative inline-block', className)}>
      {children}
      {(show && count === undefined) || (count !== undefined && count > 0) ? (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count !== undefined ? displayCount : ''}
          </span>
        </span>
      ) : null}
    </div>
  );
}

/**
 * Inline Alert
 */
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      icon: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-900',
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('rounded-lg border p-4', styles.bg, styles.border, className)}>
      <div className="flex items-start gap-3">
        {styles.icon}
        <div className="flex-1">
          {title && (
            <h3 className={cn('font-medium mb-1', styles.text)}>{title}</h3>
          )}
          <div className={cn('text-sm', styles.text)}>{children}</div>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={cn('p-1 rounded-md transition-colors', styles.text, 'hover:bg-black/5')}
            aria-label="Dismiss"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
