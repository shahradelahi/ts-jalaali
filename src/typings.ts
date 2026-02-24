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

export type MonthNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type DayNumbers =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;
export type HourNumbers =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;
export type MinuteNumbers =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59;
export type SecondNumbers = MinuteNumbers;

export interface DateObjectUnits {
  // --- Jalaali Components (Primary) ---
  /** Jalaali year (Alias: `year`) */
  jy?: number;
  /** Jalaali month 1-12 (Alias: `month`) */
  jm?: MonthNumbers;
  /** Jalaali day 1-31 (Alias: `day`) */
  jd?: DayNumbers;

  // Generic aliases (mapped to Jalaali by default in a Jalaali library)
  year?: number;
  month?: MonthNumbers;
  day?: DayNumbers;

  // --- Gregorian Components ---
  /** Gregorian year */
  gy?: number;
  /** Gregorian month 1-12 */
  gm?: MonthNumbers;
  /** Gregorian day 1-31 */
  gd?: DayNumbers;

  // --- Time Components ---
  hour?: HourNumbers;
  minute?: MinuteNumbers;
  second?: SecondNumbers;
  millisecond?: number;
}
