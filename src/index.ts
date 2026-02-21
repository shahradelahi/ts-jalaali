import { JalaaliDate } from './jalaali';
import type { JalaaliObject } from './typings';

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
export function jalaali(date: Date | string | number | JalaaliObject = new Date()): JalaaliDate {
  if (date instanceof JalaaliDate) return date;
  if (typeof date === 'object' && 'jy' in date) {
    return new JalaaliDate(date.jy, date.jm, date.jd);
  }
  return new JalaaliDate(date);
}

export { JalaaliDate };
export * from './core';
export * from './typings';
export * from './utils';
export * from './intl';
export * from './holidays';
export * from './events';
