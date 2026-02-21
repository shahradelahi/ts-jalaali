# @se-oss/jalaali

## 1.1.0

### Minor Changes

- fe854e3: Implement `JalaaliDate` class extending native `Date` with lazy caching for improved performance.
- fe854e3: Rename `JalaaliDate` and `GregorianDate` interfaces to `JalaaliObject` and `GregorianObject`.

### Patch Changes

- fe854e3: Add `JalaaliDate.fromFormat` and support for time tokens (`HH`, `mm`, `ss`) in `format()`.
