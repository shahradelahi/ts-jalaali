import { bench, describe } from 'vitest';

import { toGregorian, toJalaali } from './core';
import { jalaali } from './index';

describe('Core Conversion Performance', () => {
  bench('Gregorian -> Jalaali (Math only)', () => {
    toJalaali(2023, 10, 27);
  });

  bench('Jalaali -> Gregorian (Math only)', () => {
    toGregorian(1402, 8, 5);
  });
});

describe('Chainable API Performance', () => {
  const now = new Date();

  bench('Wrap + Format (Simple)', () => {
    jalaali(now).format('YYYY/MM/DD');
  });

  bench('Wrap + Format (Intl Text)', () => {
    jalaali(now).format('YYYY MMMM DD dddd');
  });

  bench('Math Operation (Add 1 Month)', () => {
    jalaali(now).add(1, 'month');
  });
});
