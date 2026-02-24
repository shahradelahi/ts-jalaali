# @se-oss/jalaali

## 1.2.0

### Minor Changes

- 77e8004: Add support for Persian digits in `JalaaliDate.fromFormat` and introduce `toEnglishDigits` utility.
- 7545852: Added a comprehensive `set()` API to `JalaaliDate` for updating multiple date/time components (both Jalaali and Gregorian) in a single operation with automatic day clamping.

## 1.1.0

### Minor Changes

- fe854e3: Implement `JalaaliDate` class extending native `Date` with lazy caching for improved performance.
- fe854e3: Rename `JalaaliDate` and `GregorianDate` interfaces to `JalaaliObject` and `GregorianObject`.

### Patch Changes

- fe854e3: Add `JalaaliDate.fromFormat` and support for time tokens (`HH`, `mm`, `ss`) in `format()`.
