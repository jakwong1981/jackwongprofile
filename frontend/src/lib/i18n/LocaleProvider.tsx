// frontend/src/lib/i18n/LocaleProvider.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DICTIONARIES, type MessageKey } from '@/lib/i18n/dictionaries';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, normalizeLocale } from '@/lib/i18n/locale';
import type { Locale, LocalizedText } from '@/types/api';
import { resolveLocalized } from '@/lib/i18n/locale';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  /** Translates a UI message key. */
  t: (key: MessageKey) => string;
  /** Resolves a backend-supplied multilingual value for the active locale. */
  tx: (text: LocalizedText | null | undefined) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Holds the active locale for the whole client tree. State lives in plain React
 * primitives — no third-party store — and the choice is mirrored to `localStorage`
 * so a reload keeps the visitor's language.
 */
export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}): JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      stored = null;
    }
    const resolved = stored ? normalizeLocale(stored) : normalizeLocale(window.navigator.language);
    setLocaleState(resolved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Private browsing or a storage quota error must never break locale switching.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const dictionary = DICTIONARIES[locale];
    return {
      locale,
      setLocale,
      t: (key: MessageKey) => dictionary[key],
      tx: (text: LocalizedText | null | undefined) => resolveLocalized(text, locale),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * @returns the active locale plus the two translation helpers
 * @throws Error when used outside {@link LocaleProvider}
 */
export function useTranslations(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error('useTranslations must be used inside a LocaleProvider');
  }
  return context;
}
