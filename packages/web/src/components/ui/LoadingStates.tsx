'use client';

import { cn } from '@/lib/utils';

/**
 * Spinner Component
 *
 * Circular loading spinner
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Dots Loader
 *
 * Three pulsing dots
 */
interface DotsLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function DotsLoader({ size = 'md', color = 'primary', className }: DotsLoaderProps) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <div className={cn('flex items-center gap-1', className)} role="status" aria-label="Loading">
      <div
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(
          'rounded-full animate-pulse',
          sizeClasses[size],
          colorClasses[color]
        )}
        style={{ animationDelay: '300ms' }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Progress Bar
 *
 * Linear progress indicator
 */
interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-700">{label || 'Progress'}</span>
          <span className="text-sm font-medium text-gray-900">{clampedProgress}%</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <div
          className={cn('h-full transition-all duration-300 ease-out', colorClasses[color])}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

/**
 * Indeterminate Progress Bar
 *
 * Progress bar with sliding animation (when exact progress is unknown)
 */
interface IndeterminateProgressProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function IndeterminateProgress({
  size = 'md',
  color = 'primary',
  className,
}: IndeterminateProgressProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  };

  return (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size], className)}>
      <div
        className={cn('h-full animate-indeterminate', colorClasses[color])}
        role="progressbar"
        aria-label="Loading"
      />
      <style jsx>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
            width: 30%;
          }
          50% {
            width: 30%;
          }
          100% {
            transform: translateX(400%);
            width: 30%;
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Loading Overlay
 *
 * Full-screen or component-level loading overlay
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  blur?: boolean;
  children?: React.ReactNode;
}

export function LoadingOverlay({
  isLoading,
  message,
  fullScreen = false,
  blur = false,
  children,
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  const overlay = (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white/80 z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        blur && 'backdrop-blur-sm'
      )}
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-gray-700 font-medium">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return overlay;
  }

  return (
    <div className="relative">
      {children}
      {overlay}
    </div>
  );
}

/**
 * Button Loader
 *
 * Loading state for buttons
 */
interface ButtonLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ButtonLoader({
  isLoading,
  children,
  loadingText,
  size = 'md',
}: ButtonLoaderProps) {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm';

  if (!isLoading) return <>{children}</>;

  return (
    <span className="flex items-center gap-2">
      <Spinner size={spinnerSize} color="white" />
      {loadingText || children}
    </span>
  );
}

/**
 * Pulse Loader
 *
 * Pulsing circle animation
 */
interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function PulseLoader({ size = 'md', color = 'primary', className }: PulseLoaderProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)} role="status" aria-label="Loading">
      <div
        className={cn(
          'absolute inset-0 rounded-full opacity-75 animate-ping',
          colorClasses[color]
        )}
      />
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          colorClasses[color]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton Pulse
 *
 * Alternative skeleton with shimmer effect
 */
interface SkeletonPulseProps {
  className?: string;
}

export function SkeletonPulse({ className }: SkeletonPulseProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Card Loader
 *
 * Loading state for card components
 */
export function CardLoader() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex items-center justify-center h-32">
        <Spinner size="lg" />
      </div>
    </div>
  );
}

/**
 * Page Loader
 *
 * Full-page loading state
 */
interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Spinner size="xl" />
      <p className="mt-6 text-lg text-gray-700 font-medium">{message}</p>
    </div>
  );
}

/**
 * Inline Loader
 *
 * Small inline loading indicator
 */
interface InlineLoaderProps {
  text?: string;
  size?: 'sm' | 'md';
}

export function InlineLoader({ text = 'Loading', size = 'sm' }: InlineLoaderProps) {
  return (
    <span className="inline-flex items-center gap-2 text-gray-600">
      <Spinner size={size} color="gray" />
      <span className={size === 'sm' ? 'text-sm' : 'text-base'}>{text}</span>
    </span>
  );
}

/**
 * Loading Bar (Top of Page)
 *
 * Thin loading bar at the top of the page (like YouTube/GitHub)
 */
interface LoadingBarProps {
  isLoading: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export function LoadingBar({ isLoading, color = 'primary' }: LoadingBarProps) {
  const colorClasses = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  };

  if (!isLoading) return null;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div
          className={cn(
            'h-full animate-loading-bar',
            colorClasses[color]
          )}
        />
      </div>
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

/**
 * Circular Progress
 *
 * Circular progress indicator with percentage
 */
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number; // In pixels
  strokeWidth?: number;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
}: CircularProgressProps) {
  const colorClasses = {
    primary: 'text-primary-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-300', colorClasses[color])}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-xl font-semibold text-gray-900">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
