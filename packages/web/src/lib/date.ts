/**
 * Date and Time Utility Functions
 *
 * Helper functions for date formatting, manipulation, and display
 */

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | number, format: 'short' | 'medium' | 'long' | 'full' = 'medium'): string {
  const d = new Date(date);

  const formats = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' } as Intl.DateTimeFormatOptions,
    medium: { month: 'short', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
    long: { month: 'long', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
  };

  return new Intl.DateTimeFormat('en-US', formats[format]).format(d);
}

/**
 * Format time to readable string
 */
export function formatTime(date: Date | string | number, includeSeconds: boolean = false): string {
  const d = new Date(date);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: true,
  }).format(d);
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date | string | number,
  options: {
    dateFormat?: 'short' | 'medium' | 'long' | 'full';
    includeSeconds?: boolean;
  } = {}
): string {
  const { dateFormat = 'medium', includeSeconds = false } = options;
  return `${formatDate(date, dateFormat)} at ${formatTime(date, includeSeconds)}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const isPast = diffMs < 0;
  const abs = (n: number) => Math.abs(n);

  if (abs(diffSeconds) < 60) {
    return isPast ? 'just now' : 'in a moment';
  }

  if (abs(diffMinutes) < 60) {
    const n = abs(diffMinutes);
    return isPast
      ? `${n} minute${n > 1 ? 's' : ''} ago`
      : `in ${n} minute${n > 1 ? 's' : ''}`;
  }

  if (abs(diffHours) < 24) {
    const n = abs(diffHours);
    return isPast
      ? `${n} hour${n > 1 ? 's' : ''} ago`
      : `in ${n} hour${n > 1 ? 's' : ''}`;
  }

  if (abs(diffDays) < 7) {
    const n = abs(diffDays);
    return isPast
      ? `${n} day${n > 1 ? 's' : ''} ago`
      : `in ${n} day${n > 1 ? 's' : ''}`;
  }

  if (abs(diffWeeks) < 4) {
    const n = abs(diffWeeks);
    return isPast
      ? `${n} week${n > 1 ? 's' : ''} ago`
      : `in ${n} week${n > 1 ? 's' : ''}`;
  }

  if (abs(diffMonths) < 12) {
    const n = abs(diffMonths);
    return isPast
      ? `${n} month${n > 1 ? 's' : ''} ago`
      : `in ${n} month${n > 1 ? 's' : ''}`;
  }

  const n = abs(diffYears);
  return isPast
    ? `${n} year${n > 1 ? 's' : ''} ago`
    : `in ${n} year${n > 1 ? 's' : ''}`;
}

/**
 * Format date range
 */
export function formatDateRange(
  startDate: Date | string | number,
  endDate: Date | string | number,
  options: { format?: 'short' | 'medium' | 'long' } = {}
): string {
  const { format = 'medium' } = options;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sameDay = isSameDay(start, end);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameDay) {
    return formatDate(start, format);
  }

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat('en-US', {
      month: format === 'short' ? 'short' : 'long',
      year: 'numeric',
    }).format(start);
    return `${monthYear} ${start.getDate()}-${end.getDate()}`;
  }

  if (sameYear) {
    const startStr = new Intl.DateTimeFormat('en-US', {
      month: format === 'short' ? 'short' : 'long',
      day: 'numeric',
    }).format(start);
    const endStr = formatDate(end, format);
    return `${startStr} - ${endStr}`;
  }

  return `${formatDate(start, format)} - ${formatDate(end, format)}`;
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date | string | number, date2: Date | string | number): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  return isSameDay(date, new Date());
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date | string | number): boolean {
  const d = new Date(date);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return d >= startOfWeek && d < endOfWeek;
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string | number): boolean {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string | number): boolean {
  return new Date(date) > new Date();
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Add months to a date
 */
export function addMonths(date: Date | string | number, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Add years to a date
 */
export function addYears(date: Date | string | number, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of week (Sunday)
 */
export function startOfWeek(date: Date | string | number): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return startOfDay(d);
}

/**
 * Get end of week (Saturday)
 */
export function endOfWeek(date: Date | string | number): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (6 - day));
  return endOfDay(d);
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date | string | number): Date {
  const d = new Date(date);
  d.setDate(1);
  return startOfDay(d);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date | string | number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return endOfDay(d);
}

/**
 * Calculate difference between two dates
 */
export function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' = 'days'
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = d2.getTime() - d1.getTime();

  const conversions = {
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    weeks: 1000 * 60 * 60 * 24 * 7,
    months: 1000 * 60 * 60 * 24 * 30, // Approximate
    years: 1000 * 60 * 60 * 24 * 365, // Approximate
  };

  return Math.floor(diffMs / conversions[unit]);
}

/**
 * Format duration (in milliseconds) to readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Get age from birthdate
 */
export function getAge(birthdate: Date | string | number): number {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get days until a date
 */
export function daysUntil(date: Date | string | number): number {
  return dateDiff(new Date(), date, 'days');
}

/**
 * Get countdown to a date
 */
export function getCountdown(date: Date | string | number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
}

/**
 * Format countdown to string
 */
export function formatCountdown(date: Date | string | number): string {
  const { days, hours, minutes, seconds } = getCountdown(date);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

/**
 * Get calendar month data
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export function getCalendarMonth(year: number, month: number): CalendarDay[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();

  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Add days from previous month
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    currentWeek.push({
      date,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isPast: isPast(date),
    });
  }

  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);

    currentWeek.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isPast: isPast(date),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add days from next month
  if (currentWeek.length > 0) {
    const remainingDays = 7 - currentWeek.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      currentWeek.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isPast: isPast(date),
      });
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Burning Man Specific Functions
 */

/**
 * Get Burning Man dates for a given year
 * Note: Burning Man is typically the week leading up to and including the first Monday in September
 */
export function getBurningManDates(year: number): { start: Date; end: Date } {
  // Find first Monday in September
  const septemberFirst = new Date(year, 8, 1); // Month is 0-indexed
  const firstMonday = new Date(septemberFirst);

  // Find the first Monday
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1);
  }

  // Burning Man ends on the first Monday
  const end = new Date(firstMonday);

  // Burning Man starts 8 days before (Sunday to Monday)
  const start = new Date(end);
  start.setDate(start.getDate() - 8);

  return { start, end };
}

/**
 * Check if date is during Burning Man
 */
export function isDuringBurningMan(date: Date | string | number): boolean {
  const d = new Date(date);
  const year = d.getFullYear();
  const { start, end } = getBurningManDates(year);

  return d >= start && d <= end;
}

/**
 * Get days until Burning Man
 */
export function daysUntilBurningMan(year?: number): number {
  const targetYear = year || new Date().getFullYear();
  const { start } = getBurningManDates(targetYear);
  return daysUntil(start);
}

/**
 * Format time in Burning Man time (if during event)
 */
export function formatBurningManTime(date: Date | string | number): string {
  const d = new Date(date);

  if (!isDuringBurningMan(d)) {
    return formatDateTime(d);
  }

  const { start } = getBurningManDates(d.getFullYear());
  const dayNumber = Math.floor(dateDiff(start, d, 'days')) + 1;

  const dayNames = [
    'Sunday (Gate Opening)',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'Monday (Burn Night)',
  ];

  return `${dayNames[dayNumber - 1]} ${formatTime(d)}`;
}
