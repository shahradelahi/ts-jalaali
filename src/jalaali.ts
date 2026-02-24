import { isLeapJalaaliYear, jalaaliMonthLength, toGregorian, toJalaali } from './core';
import { isHoliday, type HolidayOptions } from './holidays';
import { toEnglishDigits } from './utils';

/**
 * Cache Intl formatters to improve performance.
 */
const formatters: Record<string, Intl.DateTimeFormat> = {};

/**
 * Gets or creates a cached Intl.DateTimeFormat instance.
 *
 * @param options - Intl.DateTimeFormatOptions
 * @returns Intl.DateTimeFormat
 */
function getFormatter(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = JSON.stringify(options);
  if (!formatters[key]) {
    formatters[key] = new Intl.DateTimeFormat('fa-IR', { ...options, calendar: 'persian' });
  }
  return formatters[key];
}

interface CacheData {
  jy: number;
  jm: number;
  jd: number;
}

/**
 * JalaaliDate class extends the native Date class to provide Jalaali calendar support.
 * It maintains the underlying timestamp as a Gregorian date while providing
 * high-performance Jalaali calculations through a lazy caching mechanism.
 */
export class JalaaliDate extends Date {
  #cache: CacheData | null = null;

  constructor();
  constructor(value: number | string | Date);
  constructor(jy: number, jm: number, jd: number, h?: number, m?: number, s?: number, ms?: number);
  constructor(...args: any[]) {
    if (
      args.length >= 3 &&
      typeof args[0] === 'number' &&
      typeof args[1] === 'number' &&
      typeof args[2] === 'number'
    ) {
      const [jy, jm, jd, ...rest] = args;
      const { gy, gm, gd } = toGregorian(jy, jm, jd);
      // Native Date uses 0-indexed months, so gm - 1
      super(gy, gm - 1, gd, ...rest);
      this.#cache = { jy, jm, jd };
    } else {
      // @ts-expect-error: TS struggles with spread args on Date constructor
      super(...args);
    }
  }

  /**
   * Parses a Jalaali date string based on a provided format.
   *
   * @param value - The date string to parse
   * @param format - The format of the date string (e.g., 'YYYY/MM/DD')
   * @returns A new JalaaliDate instance
   */
  static fromFormat(value: string, format: string): JalaaliDate {
    const normalizedValue = toEnglishDigits(value);
    const tokens = ['YYYY', 'MM', 'DD', 'M', 'D', 'HH', 'mm', 'ss'];
    let jy = 0,
      jm = 1,
      jd = 1,
      h = 0,
      m = 0,
      s = 0;

    const sortedTokens = [...tokens].sort((a, b) => b.length - a.length);
    let regexStr = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const positions: { token: string; index: number }[] = [];

    for (const token of sortedTokens) {
      let index = format.indexOf(token);
      while (index !== -1) {
        if (!positions.some((p) => index >= p.index && index < p.index + p.token.length)) {
          positions.push({ token, index });
        }
        index = format.indexOf(token, index + 1);
      }
    }

    positions.sort((a, b) => a.index - b.index);

    let currentOffset = 0;
    for (const p of positions) {
      const start = p.index + currentOffset;
      const length = p.token.length;
      const replacement = '(\\d+)';
      regexStr = regexStr.slice(0, start) + replacement + regexStr.slice(start + length);
      currentOffset += replacement.length - length;
    }

    const match = normalizedValue.match(new RegExp(`^${regexStr}$`));
    if (!match) {
      throw new Error(`Value "${value}" does not match format "${format}"`);
    }

    positions.forEach((p, i) => {
      const val = parseInt(match[i + 1]);
      if (p.token === 'YYYY') jy = val;
      else if (p.token === 'MM' || p.token === 'M') jm = val;
      else if (p.token === 'DD' || p.token === 'D') jd = val;
      else if (p.token === 'HH') h = val;
      else if (p.token === 'mm') m = val;
      else if (p.token === 'ss') s = val;
    });

    return new JalaaliDate(jy, jm, jd, h, m, s);
  }

  /**
   * Invalidates the Jalaali cache.
   * Must be called whenever the underlying timestamp changes.
   */
  #invalidate(): void {
    this.#cache = null;
  }

  /**
   * Hydrates the cache if empty by calculating Jalaali components from Gregorian.
   *
   * @returns CacheData
   */
  #hydrate(): CacheData {
    if (!this.#cache) {
      this.#cache = toJalaali(this.getFullYear(), this.getMonth() + 1, this.getDate());
    }
    return this.#cache!;
  }

  /**
   * Returns the Jalaali year.
   */
  get jy(): number {
    return this.#hydrate().jy;
  }

  /**
   * Returns the Jalaali month (1-12).
   */
  get jm(): number {
    return this.#hydrate().jm;
  }

  /**
   * Returns the Jalaali day (1-31).
   */
  get jd(): number {
    return this.#hydrate().jd;
  }

  /**
   * Sets the Jalaali year.
   *
   * @param year - Jalaali year
   * @returns The new timestamp in milliseconds
   */
  setJalaaliYear(year: number): number {
    const { jm, jd } = this.#hydrate();
    const maxDays = jalaaliMonthLength(year, jm);
    const newDay = Math.min(jd, maxDays);
    const { gy, gm, gd } = toGregorian(year, jm, newDay);
    super.setFullYear(gy, gm - 1, gd);
    this.#cache = { jy: year, jm, jd: newDay };
    return this.getTime();
  }

  /**
   * Sets the Jalaali month.
   *
   * @param month - Jalaali month (1-12)
   * @param day - Optional Jalaali day (1-31)
   * @returns The new timestamp in milliseconds
   */
  setJalaaliMonth(month: number, day?: number): number {
    const { jy, jd } = this.#hydrate();
    const maxDays = jalaaliMonthLength(jy, month);
    const newDay = day ?? Math.min(jd, maxDays);
    const { gy, gm, gd } = toGregorian(jy, month, newDay);
    super.setFullYear(gy, gm - 1, gd);
    this.#cache = { jy, jm: month, jd: newDay };
    return this.getTime();
  }

  /**
   * Sets the Jalaali date.
   *
   * @param day - Jalaali day (1-31)
   * @returns The new timestamp in milliseconds
   */
  setJalaaliDate(day: number): number {
    const { jy, jm } = this.#hydrate();
    const { gy, gm, gd } = toGregorian(jy, jm, day);
    super.setFullYear(gy, gm - 1, gd);
    this.#cache = { jy, jm, jd: day };
    return this.getTime();
  }

  // --- Overriding Native Mutators to Invalidate Cache ---

  /** @inheritdoc */
  override setFullYear(year: number, month?: number, date?: number): number {
    let result: number;
    if (date !== undefined) {
      result = super.setFullYear(year, month!, date);
    } else if (month !== undefined) {
      result = super.setFullYear(year, month);
    } else {
      result = super.setFullYear(year);
    }
    this.#invalidate();
    return result;
  }

  /** @inheritdoc */
  override setMonth(month: number, date?: number): number {
    let result: number;
    if (date !== undefined) {
      result = super.setMonth(month, date);
    } else {
      result = super.setMonth(month);
    }
    this.#invalidate();
    return result;
  }

  /** @inheritdoc */
  override setDate(date: number): number {
    const result = super.setDate(date);
    this.#invalidate();
    return result;
  }

  /** @inheritdoc */
  override setTime(time: number): number {
    const result = super.setTime(time);
    this.#invalidate();
    return result;
  }

  /**
   * Checks if the current Jalaali year is a leap year.
   *
   * @returns boolean
   */
  isLeapYear(): boolean {
    return isLeapJalaaliYear(this.jy);
  }

  /**
   * Returns a new JalaaliDate instance with the same timestamp.
   *
   * @returns JalaaliDate
   */
  clone(): JalaaliDate {
    return new JalaaliDate(this.getTime());
  }

  /**
   * Adds an amount of time to the current date and returns this instance.
   * This method mutates the original object. Use .clone() if immutability is needed.
   *
   * @param amount - Amount to add (can be negative)
   * @param unit - Unit of time ('day', 'month', 'year')
   * @returns this
   */
  add(amount: number, unit: 'day' | 'month' | 'year'): this {
    if (unit === 'day') {
      this.setDate(this.getDate() + amount);
    } else if (unit === 'month') {
      const { jy, jm } = this.#hydrate();
      let newMonth = jm + amount;
      const yearDiff = Math.floor((newMonth - 1) / 12);
      const newYear = jy + yearDiff;
      newMonth = ((newMonth - 1) % 12) + 1;
      if (newMonth <= 0) newMonth += 12;

      this.setJalaaliYear(newYear);
      this.setJalaaliMonth(newMonth);
    } else if (unit === 'year') {
      this.setJalaaliYear(this.jy + amount);
    }
    return this;
  }

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
   * - HH: Hour (00-23)
   * - mm: Minute (00-59)
   * - ss: Second (00-59)
   *
   * @param pattern - Formatting pattern (defaults to 'YYYY/MM/DD')
   * @returns Formatted string
   */
  format(pattern: string = 'YYYY/MM/DD'): string {
    const { jy, jm, jd } = this.#hydrate();

    return pattern.replace(/YYYY|YY|MMMM|MM|M|dddd|DD|D|HH|mm|ss/g, (match) => {
      switch (match) {
        case 'YYYY':
          return jy.toString();
        case 'YY':
          return jy.toString().slice(-2);
        case 'MMMM':
          return getFormatter({ month: 'long' }).format(this);
        case 'MM':
          return jm.toString().padStart(2, '0');
        case 'M':
          return jm.toString();
        case 'dddd':
          return getFormatter({ weekday: 'long' }).format(this);
        case 'DD':
          return jd.toString().padStart(2, '0');
        case 'D':
          return jd.toString();
        case 'HH':
          return this.getHours().toString().padStart(2, '0');
        case 'mm':
          return this.getMinutes().toString().padStart(2, '0');
        case 'ss':
          return this.getSeconds().toString().padStart(2, '0');
        default:
          return match;
      }
    });
  }

  /**
   * Checks if the current date is a holiday in Iran.
   *
   * @param options - Holiday checking options
   * @returns boolean
   */
  isHoliday(options?: HolidayOptions): boolean {
    return isHoliday(this, options);
  }

  /**
   * Returns the Jalaali year (alias for .jy).
   *
   * @returns number
   */
  year(): number {
    return this.jy;
  }

  /**
   * Returns the Jalaali month (alias for .jm).
   *
   * @returns number
   */
  month(): number {
    return this.jm;
  }

  /**
   * Returns the Jalaali day (alias for .jd).
   *
   * @returns number
   */
  day(): number {
    return this.jd;
  }

  /**
   * Returns the underlying native Date object.
   *
   * @returns Date
   */
  toDate(): Date {
    return new Date(this.getTime());
  }

  /**
   * Overrides toString to return a Jalaali-formatted string.
   *
   * @returns string
   */
  override toString(): string {
    return this.format('dddd D MMMM YYYY');
  }
}
