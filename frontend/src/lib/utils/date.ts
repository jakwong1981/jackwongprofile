// frontend/src/lib/utils/date.ts
import { toIntlLocale } from '@/lib/i18n/locale';
import type { Locale } from '@/types/api';

/**
 * Formats an ISO date (`YYYY-MM-DD`) as a localised month + year, which is the
 * granularity a resume actually needs.
 *
 * @param isoDate ISO local date, may be `null`
 * @param locale  active locale
 * @returns the formatted label, or an empty string when the input is absent or invalid
 */
export function formatMonthYear(isoDate: string | null | undefined, locale: Locale): string {
  if (!isoDate) {
    return '';
  }
  const parsed = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(parsed);
}

/**
 * Formats a start/end pair as a resume date range.
 *
 * @param startDate    ISO start date
 * @param endDate      ISO end date, `null` when ongoing
 * @param isCurrent    whether the entry is ongoing
 * @param locale       active locale
 * @param presentLabel localised word for "Present"
 * @returns e.g. `Mar 2020 – Present`
 */
export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isCurrent: boolean,
  locale: Locale,
  presentLabel: string,
): string {
  const start = formatMonthYear(startDate, locale);
  const end = isCurrent ? presentLabel : formatMonthYear(endDate, locale);
  if (start === '' && end === '') {
    return '';
  }
  if (start === '') {
    return end;
  }
  if (end === '') {
    return start;
  }
  return `${start} – ${end}`;
}

/**
 * Formats an ISO instant as a localised date and time.
 *
 * @param isoInstant ISO-8601 instant, may be `null`
 * @param locale     active locale
 * @returns the formatted label, or an empty string
 */
export function formatDateTime(isoInstant: string | null | undefined, locale: Locale): string {
  if (!isoInstant) {
    return '';
  }
  const parsed = new Date(isoInstant);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

/**
 * Computes an inclusive duration between two dates in whole months.
 *
 * @param startDate ISO start date
 * @param endDate   ISO end date; `null` means "until today"
 * @returns the number of months, or `0` when the input is unusable
 */
export function monthsBetween(startDate: string | null | undefined, endDate: string | null | undefined): number {
  if (!startDate) {
    return 0;
  }
  const start = new Date(`${startDate.slice(0, 10)}T00:00:00Z`);
  const end = endDate ? new Date(`${endDate.slice(0, 10)}T00:00:00Z`) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  const years = end.getUTCFullYear() - start.getUTCFullYear();
  const months = end.getUTCMonth() - start.getUTCMonth();
  return Math.max(years * 12 + months + 1, 0);
}
