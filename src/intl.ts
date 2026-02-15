/**
 * Formats relative time using native `Intl.RelativeTimeFormat`.
 *
 * @param value - Numeric value to use in the relative time message
 * @param unit - Unit to use in the relative time message (e.g., 'day', 'month', 'year')
 * @param locale - Locale to use for formatting (defaults to 'fa-IR')
 * @param options - Options to pass to `Intl.RelativeTimeFormat`
 * @returns Formatted relative time string
 */
export function relativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string = 'fa-IR',
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' }
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, options);
  return rtf.format(value, unit);
}
