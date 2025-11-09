'use client';

import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export interface StatsCardProps {
  /**
   * Card title/label
   */
  title: string;
  /**
   * Main value to display
   */
  value: string | number;
  /**
   * Change percentage (positive or negative)
   */
  change?: number;
  /**
   * Change period label
   */
  changeLabel?: string;
  /**
   * Icon component
   */
  icon?: React.ReactNode;
  /**
   * Card color variant
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Stats Card Component
 *
 * Displays a key metric with optional trend indicator
 */
export function StatsCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  variant = 'default',
  isLoading = false,
  onClick,
}: StatsCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  const variantClasses = {
    default: 'border-gray-200',
    primary: 'border-primary-200 bg-primary-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
  };

  const iconColorClasses = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
  };

  if (isLoading) {
    return (
      <Card className={cn('p-6', variantClasses[variant])}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-40"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'p-6 transition-all',
        variantClasses[variant],
        onClick && 'cursor-pointer hover:shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-full',
              iconColorClasses[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900">{value}</p>

        {change !== undefined && (
          <div className="flex items-center gap-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                isPositive && 'text-green-600',
                isNegative && 'text-red-600',
                change === 0 && 'text-gray-600'
              )}
            >
              {isPositive && <ArrowUpIcon className="h-4 w-4" />}
              {isNegative && <ArrowDownIcon className="h-4 w-4" />}
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500">{changeLabel}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Stats Grid
 *
 * Grid layout for multiple stats cards
 */
interface StatsGridProps {
  stats: StatsCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}

/**
 * Mini Stats Card (Compact)
 *
 * Smaller version for tight spaces
 */
export function MiniStatsCard({
  title,
  value,
  icon,
  variant = 'default',
}: Pick<StatsCardProps, 'title' | 'value' | 'icon' | 'variant'>) {
  const variantClasses = {
    default: 'border-gray-200',
    primary: 'border-primary-200 bg-primary-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
  };

  return (
    <Card className={cn('p-4', variantClasses[variant])}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-gray-600">{icon}</div>}
        <div>
          <p className="text-xs text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}
