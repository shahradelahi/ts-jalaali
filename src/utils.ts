import { isLeapJalaaliYear, jalaaliMonthLength, toGregorian } from './core';

/**
 * Converts English digits to Persian digits.
 *
 * @param n - Number or string containing English digits
 * @returns String with English digits replaced by Persian digits
 */
export function toPersianDigits(n: number | string): string {
  const p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (d) => p[parseInt(d)]);
}

/**
 * Converts Persian digits to English digits.
 *
 * @param n - String containing Persian digits
 * @returns String with Persian digits replaced by English digits
 */
export function toEnglishDigits(n: string): string {
  const p = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
  for (let i = 0; i < 10; i++) {
    n = n.replace(p[i], i.toString());
  }
  return n;
}

/**
 * Validates a Jalaali date.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month
 * @param jd - Jalaali day
 * @returns True if the date is valid within the supported range (-61 to 3177)
 */
export function isValidJalaaliDate(jy: number, jm: number, jd: number): boolean {
  try {
    return (
      jy >= -61 && jy <= 3177 && jm >= 1 && jm <= 12 && jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
    );
  } catch {
    return false;
  }
}

/**
 * Returns an array of days in a given Jalaali month.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month
 * @returns Array of day numbers [1, 2, ..., length]
 */
export function getMonthDays(jy: number, jm: number): number[] {
  const length = jalaaliMonthLength(jy, jm);
  return Array.from({ length }, (_, i) => i + 1);
}

/**
 * Converts Jalaali year, month, and day to a native JavaScript Date object.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month
 * @param jd - Jalaali day
 * @returns Native Date object
 */
export function toJSDate(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

export { isLeapJalaaliYear, jalaaliMonthLength };
