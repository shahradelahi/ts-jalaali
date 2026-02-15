import type { GregorianDate, JalaaliDate } from './typings';

const breaks = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
  2456, 3178,
];

/**
 * Performs integer division.
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns Quotient
 */
function div(a: number, b: number): number {
  return ~~(a / b);
}

/**
 * Performs modulo operation.
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns Remainder
 */
function mod(a: number, b: number): number {
  return a - ~~(a / b) * b;
}

/**
 * Converts a Gregorian date to Jalaali.
 *
 * @param gy - Gregorian year
 * @param gm - Gregorian month (1-12)
 * @param gd - Gregorian day (1-31)
 * @returns Jalaali date object
 */
export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate {
  return d2j(g2d(gy, gm, gd));
}

/**
 * Converts a Jalaali date to Gregorian.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month (1-12)
 * @param jd - Jalaali day (1-31)
 * @returns Gregorian date object
 */
export function toGregorian(jy: number, jm: number, jd: number): GregorianDate {
  return d2g(j2d(jy, jm, jd));
}

/**
 * Checks if a Jalaali year is a leap year.
 *
 * @param jy - Jalaali year
 * @returns True if it's a leap year
 */
export function isLeapJalaaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0;
}

/**
 * Returns the number of days in a given Jalaali month.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month (1-12)
 * @returns Number of days (29, 30, or 31)
 */
export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  if (isLeapJalaaliYear(jy)) return 30;
  return 29;
}

/**
 * Internal Jalaali calendar calculation.
 *
 * @param jy - Jalaali year
 * @param withoutLeap - If true, skips leap calculation
 * @returns Calendar calculation results
 */
export function jalCal(
  jy: number,
  withoutLeap: boolean = false
): { leap: number; gy: number; march: number } {
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm, jump, leap, n, i;

  if (jy < jp || jy >= breaks[bl - 1]) throw new Error('Invalid Jalaali year ' + jy);

  for (i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump!, 33) === 4 && jump! - n === 4) leapJ += 1;

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;

  if (withoutLeap) return { leap: 0, gy, march };

  if (jump! - n < 6) n = n - jump! + div(jump! + 4, 33) * 33;
  leap = mod(mod(n + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

/**
 * Converts Jalaali date to number of days from Jalaali epoch.
 *
 * @param jy - Jalaali year
 * @param jm - Jalaali month
 * @param jd - Jalaali day
 * @returns Julian Day number
 */
export function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy, true);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

/**
 * Converts the Julian Day number to a date in the Jalaali calendar.
 *
 * @param jdn - Julian Day number
 * @returns Jalaali date object
 */
export function d2j(jdn: number): JalaaliDate {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy, false);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  let jm, jd;

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31);
      jd = mod(k, 31) + 1;
      return { jy, jm, jd };
    } else {
      k -= 186;
    }
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  jm = 7 + div(k, 30);
  jd = mod(k, 30) + 1;
  return { jy, jm, jd };
}

/**
 * Calculates the Julian Day number from Gregorian calendar dates.
 *
 * @param gy - Gregorian year
 * @param gm - Gregorian month
 * @param gd - Gregorian day
 * @returns Julian Day number
 */
export function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

/**
 * Calculates Gregorian calendar dates from the Julian Day number.
 *
 * @param jdn - Julian Day number
 * @returns Gregorian date object
 */
export function d2g(jdn: number): GregorianDate {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}
