'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  description?: string;
  color?: string;
  url?: string;
}

interface EventCalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
}

/**
 * Event Calendar Component
 *
 * Displays a monthly calendar with events
 */
export function EventCalendar({
  events = [],
  onDateClick,
  onEventClick,
}: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Get number of days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get number of days in previous month
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Get events for a specific date
  const getEventsForDate = (day: number): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });
  };

  // Generate calendar days
  const renderCalendarDays = () => {
    const days: JSX.Element[] = [];

    // Previous month's trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div
          key={`prev-${day}`}
          className="aspect-square p-2 text-gray-400 text-sm"
        >
          {day}
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const hasEvents = dayEvents.length > 0;
      const today = isToday(day);

      days.push(
        <div
          key={`current-${day}`}
          onClick={() => onDateClick?.(new Date(currentYear, currentMonth, day))}
          className={`
            aspect-square p-2 text-sm border border-gray-100
            ${onDateClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            ${today ? 'bg-primary-50 font-bold text-primary-700' : ''}
            ${hasEvents ? 'relative' : ''}
          `}
        >
          <div className="font-medium">{day}</div>
          {hasEvents && (
            <div className="mt-1 space-y-1">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                  className={`
                    text-xs px-1 py-0.5 rounded truncate
                    ${event.color ? `bg-${event.color}-100 text-${event.color}-700` : 'bg-primary-100 text-primary-700'}
                    ${onEventClick ? 'hover:opacity-75' : ''}
                  `}
                  style={event.color ? {
                    backgroundColor: event.color + '20',
                    color: event.color,
                  } : undefined}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-xs text-gray-500">
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // Next month's leading days
    const totalDays = firstDayOfMonth + daysInMonth;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="aspect-square p-2 text-gray-400 text-sm"
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousMonth}
              aria-label="Previous month"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              aria-label="Next month"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day names header */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-100">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="inline-block w-3 h-3 bg-primary-100 rounded mr-2"></span>
              {events.length} event{events.length !== 1 ? 's' : ''} this month
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Upcoming Events List
 *
 * Shows a list of upcoming events
 */
export function UpcomingEventsList({
  events = [],
  limit = 5,
  onEventClick,
}: {
  events?: CalendarEvent[];
  limit?: number;
  onEventClick?: (event: CalendarEvent) => void;
}) {
  // Sort events by date and get upcoming ones
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-gray-500">
          <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No upcoming events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingEvents.map(event => (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className={`
                p-4 border border-gray-200 rounded-lg
                ${onEventClick ? 'cursor-pointer hover:border-primary-500 hover:bg-primary-50' : ''}
                transition-colors
              `}
            >
              <div className="flex items-start gap-3">
                {/* Date badge */}
                <div className="flex-shrink-0 text-center bg-primary-100 rounded-lg p-2 min-w-[60px]">
                  <div className="text-xs font-semibold text-primary-600 uppercase">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                  <div className="text-2xl font-bold text-primary-700">
                    {new Date(event.date).getDate()}
                  </div>
                </div>

                {/* Event details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {event.title}
                  </h4>
                  {event.time && (
                    <p className="text-sm text-gray-600 mt-1">
                      🕐 {event.time}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-600">
                      📍 {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
