// frontend/src/lib/utils/date.test.ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDateRange, formatDateTime, formatMonthYear, monthsBetween } from '@/lib/utils/date';

describe('formatMonthYear', () => {
  it('formats an ISO date as month and year', () => {
    expect(formatMonthYear('2021-03-15', 'en')).toBe('Mar 2021');
  });

  it('formats in the requested locale', () => {
    expect(formatMonthYear('2021-03-15', 'zh-Hant')).toContain('2021');
  });

  it('ignores any time component', () => {
    expect(formatMonthYear('2021-03-15T22:30:00Z', 'en')).toBe('Mar 2021');
  });

  it('returns an empty string for absent or invalid input', () => {
    expect(formatMonthYear(null, 'en')).toBe('');
    expect(formatMonthYear(undefined, 'en')).toBe('');
    expect(formatMonthYear('not-a-date', 'en')).toBe('');
  });
});

describe('formatDateRange', () => {
  it('joins start and end with an en dash', () => {
    expect(formatDateRange('2019-01-01', '2021-06-01', false, 'en', 'Present')).toBe('Jan 2019 – Jun 2021');
  });

  it('uses the present label for an ongoing entry', () => {
    expect(formatDateRange('2019-01-01', null, true, 'en', 'Present')).toBe('Jan 2019 – Present');
  });

  it('ignores a stored end date when the entry is marked current', () => {
    expect(formatDateRange('2019-01-01', '2020-01-01', true, 'en', 'Present')).toBe('Jan 2019 – Present');
  });

  it('returns just the start when there is no end', () => {
    expect(formatDateRange('2019-01-01', null, false, 'en', 'Present')).toBe('Jan 2019');
  });

  it('returns just the end when there is no start', () => {
    expect(formatDateRange(null, '2021-06-01', false, 'en', 'Present')).toBe('Jun 2021');
  });

  it('returns an empty string when neither bound is usable', () => {
    expect(formatDateRange(null, null, false, 'en', 'Present')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO instant', () => {
    expect(formatDateTime('2024-05-04T10:20:00Z', 'en')).toContain('2024');
  });

  it('returns an empty string for absent or invalid input', () => {
    expect(formatDateTime(null, 'en')).toBe('');
    expect(formatDateTime('nonsense', 'en')).toBe('');
  });
});

describe('monthsBetween', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts inclusive whole months', () => {
    expect(monthsBetween('2020-01-01', '2020-12-01')).toBe(12);
  });

  it('counts a single month for the same month', () => {
    expect(monthsBetween('2020-01-05', '2020-01-25')).toBe(1);
  });

  it('spans year boundaries', () => {
    expect(monthsBetween('2019-11-01', '2020-02-01')).toBe(4);
  });

  it('measures to today when the end is open', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T00:00:00Z'));
    expect(monthsBetween('2024-01-01', null)).toBe(3);
  });

  it('returns zero for an inverted range', () => {
    expect(monthsBetween('2021-01-01', '2020-01-01')).toBe(0);
  });

  it('returns zero when the start is missing or invalid', () => {
    expect(monthsBetween(null, '2020-01-01')).toBe(0);
    expect(monthsBetween('bad', '2020-01-01')).toBe(0);
  });
});
