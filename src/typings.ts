/**
 * Represents a date object in the Jalaali (Persian) calendar.
 */
export interface JalaaliObject {
  /**
   * The Jalaali year.
   */
  jy: number;

  /**
   * The Jalaali month (1-indexed, 1-12).
   */
  jm: number;

  /**
   * The Jalaali day of the month (1-31).
   */
  jd: number;
}

/**
 * Represents a date object in the Gregorian calendar.
 */
export interface GregorianObject {
  /**
   * The Gregorian year.
   */
  gy: number;

  /**
   * The Gregorian month (1-indexed, 1-12).
   */
  gm: number;

  /**
   * The Gregorian day of the month (1-31).
   */
  gd: number;
}
