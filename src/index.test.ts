import { describe, expect, it } from 'vitest';

import {
  isHoliday,
  jalaali,
  JalaaliDate,
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from './index';

describe('Jalaali Class', () => {
  it('should be an instance of Date', () => {
    const d = jalaali();
    expect(d).toBeInstanceOf(Date);
    expect(d).toBeInstanceOf(JalaaliDate);
  });

  it('should support Jalaali constructor', () => {
    const d = new JalaaliDate(1402, 8, 5);
    expect(d.jy).toBe(1402);
    expect(d.jm).toBe(8);
    expect(d.jd).toBe(5);
    expect(d.getFullYear()).toBe(2023);
    expect(d.getMonth()).toBe(9); // Oct (0-indexed)
    expect(d.getDate()).toBe(27);
  });

  it('should support lazy caching', () => {
    const d = new JalaaliDate(1402, 8, 5);
    // Accessing jy should hydrate cache
    expect(d.jy).toBe(1402);

    // Modifying native date should invalidate cache
    d.setFullYear(2024);
    expect(d.getFullYear()).toBe(2024);
    // 2024-10-27 is 1403-08-06
    expect(d.jy).toBe(1403);
    expect(d.jm).toBe(8);
    expect(d.jd).toBe(6);
  });

  it('should be mutable', () => {
    const d = jalaali({ jy: 1402, jm: 1, jd: 1 });
    const same = d.add(1, 'day');
    expect(same).toBe(d);
    expect(d.jd).toBe(2);
  });

  it('should support clone for immutability', () => {
    const d = jalaali({ jy: 1402, jm: 1, jd: 1 });
    const cloned = d.clone().add(1, 'day');
    expect(cloned).not.toBe(d);
    expect(d.jd).toBe(1);
    expect(cloned.jd).toBe(2);
  });

  it('should support Jalaali setters', () => {
    const d = new JalaaliDate(1402, 1, 1);
    d.setJalaaliYear(1403);
    expect(d.jy).toBe(1403);
    expect(d.getFullYear()).toBe(2024);

    d.setJalaaliMonth(12);
    expect(d.jm).toBe(12);
    // 1403 is leap, so it should have 30 days
    expect(jalaaliMonthLength(1403, 12)).toBe(30);

    d.setJalaaliDate(30);
    expect(d.jd).toBe(30);
  });

  describe('set() API', () => {
    it('should set Jalaali units correctly', () => {
      const d = new JalaaliDate(1402, 1, 1);
      d.set({ year: 1403, month: 5, day: 10 });
      expect(d.jy).toBe(1403);
      expect(d.jm).toBe(5);
      expect(d.jd).toBe(10);
    });

    it('should set Gregorian units correctly and invalidate Jalaali cache', () => {
      const d = new JalaaliDate(1402, 1, 1);
      d.set({ gy: 2024, gm: 1, gd: 1 });
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(0);
      expect(d.getDate()).toBe(1);
      // 2024-01-01 is 1402-10-11
      expect(d.jy).toBe(1402);
      expect(d.jm).toBe(10);
      expect(d.jd).toBe(11);
    });

    it('should set time units correctly', () => {
      const d = new JalaaliDate(1402, 1, 1);
      d.set({ hour: 15, minute: 30, second: 45, millisecond: 500 });
      expect(d.getHours()).toBe(15);
      expect(d.getMinutes()).toBe(30);
      expect(d.getSeconds()).toBe(45);
      expect(d.getMilliseconds()).toBe(500);
    });

    it('should handle day clamping when changing Jalaali month', () => {
      // 1402-06-31 (last day of 31-day month)
      const d = new JalaaliDate(1402, 6, 31);
      // Change to month 7 (30-day month)
      d.set({ month: 7 });
      expect(d.jm).toBe(7);
      expect(d.jd).toBe(30);
    });

    it('should throw error when both Jalaali and Gregorian units are provided', () => {
      const d = new JalaaliDate();
      expect(() => d.set({ year: 1403, gy: 2024 })).toThrow(
        'Cannot set both Jalaali and Gregorian date units at the same time.'
      );
    });

    it('should invalidate cache when time mutators are used', () => {
      const d = new JalaaliDate(1402, 1, 1, 12, 0, 0);
      expect(d.jd).toBe(1);

      // Set hours
      d.setHours(23);
      expect(d.getHours()).toBe(23);

      d.setMinutes(45);
      expect(d.getMinutes()).toBe(45);

      d.setSeconds(30);
      expect(d.getSeconds()).toBe(30);

      d.setMilliseconds(500);
      expect(d.getMilliseconds()).toBe(500);
    });
  });

  it('should parse Jalaali strings correctly using fromFormat', () => {
    const d = JalaaliDate.fromFormat('1404/12/02', 'YYYY/MM/DD');
    // Jalaali 1404-12-02 is Gregorian 2026-02-21
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(1); // Feb
    expect(d.getDate()).toBe(21);
    expect(d.toISOString()).toContain('2026-02-21');
  });

  it('should parse Persian digits with fromFormat', () => {
    const d = JalaaliDate.fromFormat('۱۴۰۴/۱۱/۲۹ ۱۸:۱۸', 'YYYY/MM/DD HH:mm');
    expect(d.jy).toBe(1404);
    expect(d.jm).toBe(11);
    expect(d.jd).toBe(29);
    expect(d.getHours()).toBe(18);
    expect(d.getMinutes()).toBe(18);
  });

  it('should parse English digits with fromFormat', () => {
    const d = JalaaliDate.fromFormat('1404/11/29 18:18', 'YYYY/MM/DD HH:mm');
    expect(d.jy).toBe(1404);
    expect(d.jm).toBe(11);
    expect(d.jd).toBe(29);
    expect(d.getHours()).toBe(18);
    expect(d.getMinutes()).toBe(18);
  });

  it('should parse Jalaali strings with time correctly', () => {
    const d = JalaaliDate.fromFormat('1404-12-02 14:30:45', 'YYYY-MM-DD HH:mm:ss');
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(45);
  });
});

describe('Jalaali Core', () => {
  it('should convert Gregorian to Jalaali correctly', () => {
    expect(toJalaali(2023, 10, 27)).toEqual({ jy: 1402, jm: 8, jd: 5 });
    expect(toJalaali(2021, 3, 21)).toEqual({ jy: 1400, jm: 1, jd: 1 });
  });

  it('should convert Jalaali to Gregorian correctly', () => {
    expect(toGregorian(1402, 8, 5)).toEqual({ gy: 2023, gm: 10, gd: 27 });
    expect(toGregorian(1400, 1, 1)).toEqual({ gy: 2021, gm: 3, gd: 21 });
  });
});

describe('Jalaali Chainable API', () => {
  it('should create a jalaali instance and get parts', () => {
    const d = jalaali(new Date(2023, 9, 27)); // Oct is 9 (0-indexed)
    expect(d.year()).toBe(1402);
    expect(d.month()).toBe(8);
    expect(d.day()).toBe(5);
  });

  it('should format correctly', () => {
    const d = jalaali(new Date(2023, 9, 27));
    expect(d.format('YYYY/MM/DD')).toBe('1402/08/05');
    expect(d.format('YY/M/D')).toBe('02/8/5');
  });

  it('should add days correctly', () => {
    const d = jalaali({ jy: 1402, jm: 1, jd: 31 });
    const next = d.add(1, 'day');
    expect(next.format('YYYY/MM/DD')).toBe('1402/02/01');
  });

  it('should add months correctly', () => {
    const d = jalaali({ jy: 1402, jm: 6, jd: 31 });
    const next = d.add(1, 'month');
    expect(next.format('YYYY/MM/DD')).toBe('1402/07/30'); // Mehr has 30 days
  });

  it('should handle leap years in add', () => {
    const d = jalaali({ jy: 1402, jm: 12, jd: 29 });
    const next = d.add(1, 'day');
    expect(next.format('YYYY/MM/DD')).toBe('1403/01/01'); // 1402 is not leap

    // 1403 is leap in Jalaali? Let's check 1399
    const dLeap = jalaali({ jy: 1399, jm: 12, jd: 30 });
    expect(dLeap.isLeapYear()).toBe(true);
    expect(dLeap.add(1, 'day').format('YYYY/MM/DD')).toBe('1400/01/01');
  });
});

describe('Holidays', () => {
  it('should detect Nowruz (Fixed Solar)', () => {
    const nowruz = jalaali({ jy: 1402, jm: 1, jd: 1 });
    expect(nowruz.isHoliday()).toBe(true);
  });

  it('should detect Fridays', () => {
    // 2023-10-27 was a Friday
    const friday = new Date(2023, 9, 27);
    expect(isHoliday(friday)).toBe(true);
  });

  it('should allow disabling Friday check', () => {
    // 2023-10-27 was a Friday
    const friday = new Date(2023, 9, 27);
    expect(isHoliday(friday, { checkFriday: false })).toBe(false);
  });

  it('should allow including custom events', () => {
    const customDay = jalaali({ jy: 1402, jm: 7, jd: 10 });
    expect(customDay.isHoliday()).toBe(false);

    expect(
      customDay.isHoliday({
        events: [{ month: 7, day: 10 }],
      })
    ).toBe(true);
  });
});

describe('Advanced Formatting', () => {
  it('should format text using Intl', () => {
    const d = jalaali({ jy: 1402, jm: 1, jd: 1 }); // Norouz
    const output = d.format('MMMM dddd');
    expect(output).not.toContain('MMMM');
    expect(output).not.toContain('dddd');
    expect(output.length).toBeGreaterThan(5);
  });
});
