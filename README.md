<h1 align="center">
  <sup>@se-oss/jalaali</sup>
  <br>
  <a href="https://github.com/shahradelahi/ts-jalaali/actions/workflows/ci.yml"><img src="https://github.com/shahradelahi/ts-jalaali/actions/workflows/ci.yml/badge.svg?branch=main&event=push" alt="CI"></a>
  <a href="https://www.npmjs.com/package/@se-oss/jalaali"><img src="https://img.shields.io/npm/v/@se-oss/jalaali.svg" alt="NPM Version"></a>
  <a href="/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat" alt="MIT License"></a>
  <a href="https://bundlephobia.com/package/@se-oss/jalaali"><img src="https://img.shields.io/bundlephobia/minzip/@se-oss/jalaali" alt="npm bundle size"></a>
  <a href="https://packagephobia.com/result?p=@se-oss/jalaali"><img src="https://packagephobia.com/badge?p=@se-oss/jalaali" alt="Install Size"></a>
</h1>

_@se-oss/jalaali_ is a modern, lightweight, and tree-shakable Jalaali (Persian) calendar library for TypeScript and JavaScript, featuring a chainable API and native `Intl` support.

---

- [Installation](#-installation)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#license)

## 📦 Installation

```bash
pnpm add @se-oss/jalaali
```

<details>
<summary>Install using your favorite package manager</summary>

**npm**

```bash
npm install @se-oss/jalaali
```

**yarn**

```bash
yarn add @se-oss/jalaali
```

</details>

## 📖 Usage

### Basic Usage

Chainable API for intuitive date manipulation and formatting.

```ts
import { jalaali } from '@se-oss/jalaali';

const date = jalaali('2023-10-27');
console.log(date.format('YYYY/MM/DD')); // 1402/08/05
```

### Advanced Formatting

Support for localized month names and weekdays using native `Intl`.

```ts
const date = jalaali('2023-03-21');
console.log(date.format('D MMMM dddd')); // ۱ فروردین Tuesday
```

### Holidays

Detect Iran's official holidays and events (including dynamic religious holidays for the current year).

```ts
// Access the full list of events
import { CALENDAR_EVENTS } from '@se-oss/jalaali';

const date = jalaali({ jy: 1404, jm: 1, jd: 1 });
console.log(date.isHoliday()); // true (Nowruz)

console.log(CALENDAR_EVENTS[0]); // { month: 1, day: 1, title: '...', is_holiday: true }
```

### Date Arithmetic

Immutable manipulation that respects Jalaali month lengths and leap years.

```ts
const nextMonth = jalaali({ jy: 1402, jm: 6, jd: 31 }).add(1, 'month');
console.log(nextMonth.format('YYYY/MM/DD')); // 1402/07/30 (Mehr has 30 days)
```

### Persian Digits

Built-in utility for converting digits to Persian.

```ts
import { toPersianDigits } from '@se-oss/jalaali';

console.log(toPersianDigits(1402)); // ۱۴۰۲
```

### Relative Time

Leverage native `Intl.RelativeTimeFormat` with a simple wrapper.

```ts
import { relativeTime } from '@se-oss/jalaali';

console.log(relativeTime(-2, 'day')); // ۲ روز پیش
```

### CLI

Quickly check dates or convert them from your terminal.

```bash
# Show today's date (includes holiday status)
npx jalaali today

# Convert Jalaali to Gregorian
npx jalaali convert 1402/08/05
```

## 📚 Documentation

For all configuration options and detailed API references, please see [the API docs](https://www.jsdocs.io/package/@se-oss/jalaali).

## 🤝 Contributing

Want to contribute? Awesome! To show your support is to star the project, or to raise issues on [GitHub](https://github.com/shahradelahi/ts-jalaali).

Thanks again for your support, it is much appreciated! 🙏

## License

[MIT](/LICENSE) © [Shahrad Elahi](https://github.com/shahradelahi) and [contributors](https://github.com/shahradelahi/ts-jalaali/graphs/contributors).
