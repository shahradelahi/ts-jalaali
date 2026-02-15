import { toGregorian, toJalaali } from './core';
import { isHoliday, type HolidayOptions } from './holidays';
import type { JalaaliDate } from './typings';
import { isLeapJalaaliYear, jalaaliMonthLength } from './utils';

/**
 * Cache Intl formatters to improve performance.
 */
const formatters: Record<string, Intl.DateTimeFormat> = {};

/**
 * Gets or creates a cached Intl.DateTimeFormat instance.
 */
function getFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  if (!formatters[key]) {
    formatters[key] = new Intl.DateTimeFormat('fa-IR', { ...options, calendar: 'persian' });
  }
  return formatters[key];
}

/**
 * Creates a Jalaali date instance for chainable API.
 *
 * @param date - Initial date (Date object, string, number, or JalaaliDate object)
 * @returns Chainable Jalaali API
 *
 * @example
 * ```ts
 * const d = jalaali('2023-10-27');
 * d.format('YYYY/MM/DD'); // '1402/08/05'
 * ```
 */
export function jalaali(date: Date | string | number | JalaaliDate = new Date()) {
  let d: Date;

  if (date instanceof Date) {
    d = new Date(date);
  } else if (typeof date === 'object' && 'jy' in date) {
    const { gy, gm, gd } = toGregorian(date.jy, date.jm, date.jd);
    d = new Date(gy, gm - 1, gd);
  } else {
    d = new Date(date);
  }

  return {
    /**
     * Returns the underlying native Date object.
     *
     * @returns A new Date instance
     */
    toDate: () => new Date(d),

    /**
     * Returns the Jalaali year.
     *
     * @returns Jalaali year
     */
    year: () => toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()).jy,

    /**
     * Returns the Jalaali month (1-12).
     *
     * @returns Jalaali month
     */
    month: () => toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()).jm,

    /**
     * Returns the Jalaali day of the month (1-31).
     *
     * @returns Jalaali day
     */
    day: () => toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()).jd,

    /**
     * Adds an amount of time to the current date and returns a new jalaali instance.
     *
     * @param amount - Amount to add (can be negative for subtraction)
     * @param unit - Time unit ('day', 'month', or 'year')
     * @returns New chainable Jalaali instance
     */
    add: (amount: number, unit: 'day' | 'month' | 'year') => {
      const newDate = new Date(d);
      if (unit === 'day') {
        newDate.setDate(newDate.getDate() + amount);
      } else if (unit === 'month') {
        const { jy, jm, jd } = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        let newMonth = jm + amount;
        const newYear = jy + Math.floor((newMonth - 1) / 12);
        newMonth = ((newMonth - 1) % 12) + 1;
        if (newMonth <= 0) newMonth += 12;

        const maxDays = jalaaliMonthLength(newYear, newMonth);
        const newDay = Math.min(jd, maxDays);
        const { gy, gm, gd } = toGregorian(newYear, newMonth, newDay);
        return jalaali(new Date(gy, gm - 1, gd));
      } else if (unit === 'year') {
        const { jy, jm, jd } = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
        const newYear = jy + amount;
        const maxDays = jalaaliMonthLength(newYear, jm);
        const newDay = Math.min(jd, maxDays);
        const { gy, gm, gd } = toGregorian(newYear, jm, newDay);
        return jalaali(new Date(gy, gm - 1, gd));
      }
      return jalaali(newDate);
    },

    /**
     * Formats the current Jalaali date using a pattern.
     * Supported tokens:
     * - YYYY: Year (1402)
     * - YY: Short Year (02)
     * - MMMM: Month Name (Farvardin/فروردین)
     * - MM: Month with leading zero (01-12)
     * - M: Month (1-12)
     * - dddd: Weekday (Shanbeh/شنبه)
     * - DD: Day with leading zero (01-31)
     * - D: Day (1-31)
     *
     * @param pattern - Formatting pattern (defaults to 'YYYY/MM/DD')
     * @returns Formatted date string
     */
    format: (pattern: string = 'YYYY/MM/DD') => {
      const { jy, jm, jd } = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());

      return pattern.replace(/YYYY|YY|MMMM|MM|M|dddd|DD|D/g, (match) => {
        switch (match) {
          case 'YYYY':
            return jy.toString();
          case 'YY':
            return jy.toString().slice(-2);
          case 'MMMM':
            return getFormatter({ month: 'long' }).format(d);
          case 'MM':
            return jm.toString().padStart(2, '0');
          case 'M':
            return jm.toString();
          case 'dddd':
            return getFormatter({ weekday: 'long' }).format(d);
          case 'DD':
            return jd.toString().padStart(2, '0');
          case 'D':
            return jd.toString();
          default:
            return match;
        }
      });
    },

    /**
     * Checks if the current Jalaali year is a leap year.
     *
     * @returns True if leap year
     */
    isLeapYear: () =>
      isLeapJalaaliYear(toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()).jy),

    /**
     * Checks if the date is a holiday.
     *
     * @param options - Holiday checking options.
     * @returns True if the date is a holiday.
     */
    isHoliday: (options?: HolidayOptions) => isHoliday(d, options),
  };
}

export * from './core';
export * from './typings';
export * from './utils';
export * from './intl';
export * from './holidays';
export * from './events';
