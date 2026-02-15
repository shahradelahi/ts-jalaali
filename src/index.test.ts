import { describe, expect, it } from 'vitest';

import { isHoliday, jalaali, toGregorian, toJalaali } from './index';

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
