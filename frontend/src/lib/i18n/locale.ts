// frontend/src/lib/i18n/locale.ts
import type { Locale, LocalizedText } from '@/types/api';

/** Locales offered by the runtime switcher, in display order. */
export const LOCALES: readonly Locale[] = ['zh-Hant', 'zh-Hans', 'en'] as const;

/** Locale used whenever a requested tag cannot be resolved. */
export const DEFAULT_LOCALE: Locale = 'zh-Hant';

/** Key under which the visitor's choice is remembered. */
export const LOCALE_STORAGE_KEY = 'profile.locale';

/** Human readable labels, each written in its own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  'zh-Hant': '繁體中文',
  'zh-Hans': '简体中文',
  en: 'English',
};

/**
 * Resolves an arbitrary language tag to a supported locale, tolerating the common
 * browser aliases (`zh-TW`, `zh-HK`, `zh-CN`, bare `zh`).
 *
 * @param tag candidate tag, may be `null`
 * @returns a supported locale, never `undefined`
 */
export function normalizeLocale(tag: string | null | undefined): Locale {
  if (!tag) {
    return DEFAULT_LOCALE;
  }
  const lower = tag.trim().toLowerCase();
  if (lower === 'en' || lower.startsWith('en-')) {
    return 'en';
  }
  if (lower === 'zh-hant' || lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-mo') {
    return 'zh-Hant';
  }
  if (lower === 'zh-hans' || lower === 'zh-cn' || lower === 'zh-sg' || lower === 'zh') {
    return 'zh-Hans';
  }
  if (lower.startsWith('zh-hant')) {
    return 'zh-Hant';
  }
  if (lower.startsWith('zh')) {
    return 'zh-Hans';
  }
  return DEFAULT_LOCALE;
}

/**
 * Picks the best available translation, mirroring the backend fallback chain:
 * requested locale, then the sibling Chinese variant, then English, then anything present.
 *
 * @param text   localised value, may be `null`
 * @param locale requested locale
 * @returns the resolved string, or an empty string when no translation exists
 */
export function resolveLocalized(text: LocalizedText | null | undefined, locale: Locale): string {
  if (!text) {
    return '';
  }
  const { en, zhHant, zhHans } = text;
  const order: Array<string | null | undefined> =
    locale === 'en' ? [en, zhHant, zhHans]
      : locale === 'zh-Hant' ? [zhHant, zhHans, en]
        : [zhHans, zhHant, en];

  for (const candidate of order) {
    if (candidate !== null && candidate !== undefined && candidate.trim() !== '') {
      return candidate;
    }
  }
  return '';
}

/**
 * Writes one translation into a localised value without discarding the others.
 *
 * @param text   current value, may be `null`
 * @param locale locale being edited
 * @param value  new text for that locale
 * @returns a new localised value
 */
export function withTranslation(
  text: LocalizedText | null | undefined,
  locale: Locale,
  value: string,
): LocalizedText {
  const base: LocalizedText = { en: text?.en ?? null, zhHant: text?.zhHant ?? null, zhHans: text?.zhHans ?? null };
  if (locale === 'en') {
    return { ...base, en: value };
  }
  if (locale === 'zh-Hant') {
    return { ...base, zhHant: value };
  }
  return { ...base, zhHans: value };
}

/**
 * @param text localised value
 * @returns `true` when no locale carries any non-blank text
 */
export function isLocalizedEmpty(text: LocalizedText | null | undefined): boolean {
  if (!text) {
    return true;
  }
  return [text.en, text.zhHant, text.zhHans].every((value) => !value || value.trim() === '');
}

/** Maps a locale onto the BCP-47 tag used by `Intl` formatters. */
export function toIntlLocale(locale: Locale): string {
  switch (locale) {
    case 'zh-Hant':
      return 'zh-Hant-HK';
    case 'zh-Hans':
      return 'zh-Hans-CN';
    default:
      return 'en-GB';
  }
}
