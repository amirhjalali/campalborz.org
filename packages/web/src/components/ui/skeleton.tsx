import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Skeleton Component
 *
 * A loading placeholder that shows a pulsing animation while content is loading.
 * Use this to improve perceived performance and provide visual feedback.
 *
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-20 w-full rounded-lg" />
 * ```
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

/**
 * Card Skeleton
 *
 * Pre-built skeleton for card layouts
 */
function CardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton
 */
function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Event Card Skeleton
 */
function EventCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

/**
 * Member Card Skeleton
 */
function MemberCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

/**
 * Stats Grid Skeleton
 */
function StatsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(count, 4)} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-6">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-11 w-32 mt-6" />
    </div>
  );
}

/**
 * List Skeleton
 */
function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

/**
 * Dashboard Skeleton
 */
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <StatsGridSkeleton count={4} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="border border-gray-200 rounded-lg p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Table Section */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Page Skeleton
 */
function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-full max-w-2xl" />
          <Skeleton className="h-6 w-5/6 max-w-2xl" />
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Spinner Component
 */
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'border' | 'dots' | 'bars';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

function Spinner({
  size = 'md',
  variant = 'border',
  color = 'primary',
  className,
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  if (variant === 'border') {
    return (
      <div
        className={cn(
          'animate-spin rounded-full border-4 border-t-transparent',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
      />
    );
  }

  if (variant === 'dots') {
    const dotSizes = {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };

    const dotColors = {
      primary: 'bg-primary-600',
      white: 'bg-white',
      gray: 'bg-gray-600',
    };

    return (
      <div className={cn('flex gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-bounce',
              dotSizes[size],
              dotColors[color]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'bars') {
    const barSizes = {
      sm: 'h-4 w-1',
      md: 'h-6 w-1.5',
      lg: 'h-8 w-2',
      xl: 'h-10 w-2.5',
    };

    const barColors = {
      primary: 'bg-primary-600',
      white: 'bg-white',
      gray: 'bg-gray-600',
    };

    return (
      <div className={cn('flex items-end gap-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-sm animate-pulse',
              barSizes[size],
              barColors[color]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1s',
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Loading Overlay
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
  message?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
  blur?: boolean;
  className?: string;
}

function LoadingOverlay({
  isLoading,
  children,
  message,
  spinnerSize = 'lg',
  blur = true,
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children && (
        <div className={cn('pointer-events-none', blur && 'blur-sm opacity-50')}>
          {children}
        </div>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/80">
        <Spinner size={spinnerSize} />
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}

/**
 * Page Loading Component
 */
function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner size="xl" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Inline Loading Component
 */
interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function InlineLoading({ message, size = 'sm', className }: InlineLoadingProps) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Spinner size={size} />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
}

/**
 * Button Loading State
 */
function ButtonLoading({ className }: { className?: string }) {
  return (
    <Spinner size="sm" color="white" className={className} />
  );
}

export {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  EventCardSkeleton,
  MemberCardSkeleton,
  StatsGridSkeleton,
  FormSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  PageSkeleton,
  Spinner,
  LoadingOverlay,
  PageLoading,
  InlineLoading,
  ButtonLoading,
};
