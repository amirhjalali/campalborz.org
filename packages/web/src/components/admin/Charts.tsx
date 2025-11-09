'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Simple Bar Chart (CSS-based, no dependencies)
 */
interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  showValues?: boolean;
  className?: string;
}

export function BarChart({
  data,
  title,
  height = 300,
  showValues = true,
  className,
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4" style={{ height: `${height}px` }}>
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.label}</span>
                  {showValues && (
                    <span className="font-medium text-gray-900">{item.value}</span>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8">
                  <div
                    className={cn(
                      'h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-3',
                      item.color || 'bg-primary-600'
                    )}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 20 && showValues && (
                      <span className="text-white text-sm font-medium">
                        {item.value}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple Line Chart Data Display
 */
interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  title?: string;
  height?: number;
  color?: string;
  className?: string;
}

export function LineChart({
  data,
  title,
  height = 300,
  color = 'bg-primary-600',
  className,
}: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="relative" style={{ height: `${height}px` }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
            <span>{maxValue}</span>
            <span>{Math.round((maxValue + minValue) / 2)}</span>
            <span>{minValue}</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 h-full flex items-end gap-2">
            {data.map((item, index) => {
              const percentage = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end" style={{ height: `${height - 40}px` }}>
                    <div
                      className={cn(
                        'w-full rounded-t transition-all duration-500',
                        color
                      )}
                      style={{ height: `${percentage}%` }}
                      title={`${item.label}: ${item.value}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 truncate w-full text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Pie Chart (CSS-based)
 */
interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  title?: string;
  size?: number;
  showLegend?: boolean;
  className?: string;
}

export function PieChart({
  data,
  title,
  size = 200,
  showLegend = true,
  className,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Pie chart */}
          <div
            className="relative rounded-full shadow-lg"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              background: `conic-gradient(${data
                .map((item, index) => {
                  const startPercent = data
                    .slice(0, index)
                    .reduce((sum, d) => sum + d.value, 0) / total * 100;
                  const endPercent = startPercent + (item.value / total * 100);
                  return `${item.color} ${startPercent}% ${endPercent}%`;
                })
                .join(', ')})`,
            }}
          >
            {/* Center circle */}
            <div
              className="absolute inset-0 m-auto bg-white rounded-full flex items-center justify-center"
              style={{
                width: `${size * 0.6}px`,
                height: `${size * 0.6}px`,
              }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="flex-1 space-y-2">
              {data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {item.value}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Activity Timeline
 */
interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
  title?: string;
  className?: string;
}

export function ActivityTimeline({
  events,
  title,
  className,
}: ActivityTimelineProps) {
  const typeColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-3 h-3 rounded-full',
                    event.type ? typeColors[event.type] : 'bg-gray-400'
                  )}
                />
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-1" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {event.icon && (
                    <div className="text-gray-400">{event.icon}</div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">{event.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Metric Comparison Card
 */
interface MetricComparisonProps {
  title: string;
  metrics: Array<{
    label: string;
    current: number;
    previous: number;
    format?: (value: number) => string;
  }>;
  className?: string;
}

export function MetricComparison({
  title,
  metrics,
  className,
}: MetricComparisonProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = metric.current - metric.previous;
            const changePercent = metric.previous > 0
              ? ((change / metric.previous) * 100).toFixed(1)
              : 0;
            const isPositive = change > 0;
            const format = metric.format || ((v) => v.toString());

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{metric.label}</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                    )}
                  >
                    {isPositive ? '+' : ''}{changePercent}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Current</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(metric.current)}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Previous</p>
                    <p className="text-lg text-gray-600">
                      {format(metric.previous)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
