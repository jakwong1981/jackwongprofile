// frontend/src/lib/i18n/locale.test.ts
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  isLocalizedEmpty,
  normalizeLocale,
  resolveLocalized,
  toIntlLocale,
  withTranslation,
} from '@/lib/i18n/locale';
import type { LocalizedText } from '@/types/api';

describe('normalizeLocale', () => {
  it('maps the exact supported tags', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('zh-Hant')).toBe('zh-Hant');
    expect(normalizeLocale('zh-Hans')).toBe('zh-Hans');
  });

  it('maps traditional Chinese regional aliases', () => {
    expect(normalizeLocale('zh-TW')).toBe('zh-Hant');
    expect(normalizeLocale('zh-HK')).toBe('zh-Hant');
    expect(normalizeLocale('zh-MO')).toBe('zh-Hant');
  });

  it('maps simplified Chinese regional aliases', () => {
    expect(normalizeLocale('zh-CN')).toBe('zh-Hans');
    expect(normalizeLocale('zh-SG')).toBe('zh-Hans');
    expect(normalizeLocale('zh')).toBe('zh-Hans');
  });

  it('maps English regional variants', () => {
    expect(normalizeLocale('en-GB')).toBe('en');
    expect(normalizeLocale('en-US')).toBe('en');
  });

  it('is case- and whitespace-insensitive', () => {
    expect(normalizeLocale('  ZH-tw ')).toBe('zh-Hant');
  });

  it('falls back to the default for unknown or absent tags', () => {
    expect(normalizeLocale('fr-FR')).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(normalizeLocale('')).toBe(DEFAULT_LOCALE);
  });
});

describe('resolveLocalized', () => {
  const full: LocalizedText = { en: 'English', zhHant: '繁體', zhHans: '简体' };

  it('returns the requested translation when present', () => {
    expect(resolveLocalized(full, 'en')).toBe('English');
    expect(resolveLocalized(full, 'zh-Hant')).toBe('繁體');
    expect(resolveLocalized(full, 'zh-Hans')).toBe('简体');
  });

  it('falls back to the sibling Chinese variant before English', () => {
    expect(resolveLocalized({ en: 'English', zhHans: '简体' }, 'zh-Hant')).toBe('简体');
    expect(resolveLocalized({ en: 'English', zhHant: '繁體' }, 'zh-Hans')).toBe('繁體');
  });

  it('falls back to Chinese when English is missing', () => {
    expect(resolveLocalized({ zhHant: '繁體' }, 'en')).toBe('繁體');
  });

  it('skips blank translations', () => {
    expect(resolveLocalized({ en: '   ', zhHant: '繁體' }, 'en')).toBe('繁體');
  });

  it('returns an empty string when nothing is populated', () => {
    expect(resolveLocalized({ en: null, zhHant: null, zhHans: null }, 'en')).toBe('');
    expect(resolveLocalized(null, 'en')).toBe('');
    expect(resolveLocalized(undefined, 'en')).toBe('');
  });
});

describe('withTranslation', () => {
  it('writes the requested locale', () => {
    expect(withTranslation(null, 'en', 'Hello').en).toBe('Hello');
    expect(withTranslation(null, 'zh-Hant', '你好').zhHant).toBe('你好');
    expect(withTranslation(null, 'zh-Hans', '你好').zhHans).toBe('你好');
  });

  it('preserves the sibling translations', () => {
    const existing: LocalizedText = { en: 'English', zhHant: '繁體', zhHans: '简体' };
    const next = withTranslation(existing, 'en', 'Updated');
    expect(next).toEqual({ en: 'Updated', zhHant: '繁體', zhHans: '简体' });
  });

  it('does not mutate the input', () => {
    const existing: LocalizedText = { en: 'English', zhHant: null, zhHans: null };
    withTranslation(existing, 'en', 'Changed');
    expect(existing.en).toBe('English');
  });

  it('normalises absent siblings to null', () => {
    expect(withTranslation(undefined, 'en', 'x')).toEqual({ en: 'x', zhHant: null, zhHans: null });
  });
});

describe('isLocalizedEmpty', () => {
  it('treats absent values as empty', () => {
    expect(isLocalizedEmpty(null)).toBe(true);
    expect(isLocalizedEmpty(undefined)).toBe(true);
  });

  it('treats blank strings as empty', () => {
    expect(isLocalizedEmpty({ en: '', zhHant: '  ', zhHans: null })).toBe(true);
  });

  it('reports a populated value as non-empty', () => {
    expect(isLocalizedEmpty({ en: null, zhHant: '繁體', zhHans: null })).toBe(false);
  });
});

describe('toIntlLocale', () => {
  it('maps each locale to a BCP-47 tag Intl understands', () => {
    expect(toIntlLocale('zh-Hant')).toBe('zh-Hant-HK');
    expect(toIntlLocale('zh-Hans')).toBe('zh-Hans-CN');
    expect(toIntlLocale('en')).toBe('en-GB');
  });
});
