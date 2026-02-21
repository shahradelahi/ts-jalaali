import { toJalaali } from './core';
import { CALENDAR_EVENTS, type CalendarEvent } from './events';
import type { JalaaliObject } from './typings';

/**
 * Represents a holiday event.
 */
export type HolidayItem = Partial<CalendarEvent> & Pick<CalendarEvent, 'month' | 'day'>;

/**
 * Options for checking holidays.
 */
export interface HolidayOptions {
  /**
   * Treat Fridays as holidays?
   * @default true
   */
  checkFriday?: boolean;
  /**
   * Additional days to treat as holidays.
   * 0 = Sunday, 1 = Monday, ..., 6 = Saturday
   */
  includeWeekdays?: number[];
  /**
   * Custom list of holidays to check against (merges with defaults).
   * Use this to pass dynamic Lunar holidays for the current year.
   */
  events?: HolidayItem[];
}

/**
 * Determines if the specified date is a holiday.
 *
 * @param date - The Date object or Jalaali date object to check.
 * @param options - Configuration options.
 * @returns True if the date is a holiday.
 */
export function isHoliday(date: Date | JalaaliObject, options: HolidayOptions = {}): boolean {
  const { checkFriday = true, includeWeekdays = [], events = [] } = options;

  let jd: number, jm: number, dayOfWeek: number;

  if (date instanceof Date) {
    const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    jd = j.jd;
    jm = j.jm;
    dayOfWeek = date.getDay(); // 0 = Sunday, 5 = Friday
  } else {
    jd = date.jd;
    jm = date.jm;
    // We can't know the day of the week from JalaaliDate alone without conversion.
    dayOfWeek = -1;
  }

  // 1. Check Weekdays
  if (dayOfWeek !== -1) {
    if (checkFriday && dayOfWeek === 5) return true;
    if (includeWeekdays.includes(dayOfWeek)) return true;
  }

  // 2. Check Calendar Events
  if (CALENDAR_EVENTS.some((h) => h.month === jm && h.day === jd && h.is_holiday)) {
    return true;
  }

  // 3. Check Custom Events
  if (events.length > 0) {
    if (events.some((h) => h.month === jm && h.day === jd)) {
      return true;
    }
  }

  return false;
}
