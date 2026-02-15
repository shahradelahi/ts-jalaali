#!/usr/bin/env node

/* eslint-disable no-console */
import { jalaali, toGregorian } from './index';

const args = process.argv.slice(2);
const command = args[0];

if (command === 'today') {
  const d = jalaali();
  const isHol = d.isHoliday();
  console.log(`📅 Current Date:`);
  console.log(`Gregorian: ${d.toDate().toISOString().split('T')[0]}`);
  console.log(`Jalaali:   ${d.format('YYYY/MM/DD')}${isHol ? ' 🎉 (Holiday)' : ''}`);
} else if (command === 'convert' && args[1]) {
  const [jy, jm, jd] = args[1].split('/').map(Number);
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  console.log(`${gy}-${gm.toString().padStart(2, '0')}-${gd.toString().padStart(2, '0')}`);
} else {
  console.log('Usage:');
  console.log("  jalaali today           Show today's date in Jalaali");
  console.log('  jalaali convert JY/JM/JD  Convert Jalaali to Gregorian');
}
