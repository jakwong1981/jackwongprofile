// frontend/src/components/layout/LocaleSwitcher.tsx
'use client';

import { Languages } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { LOCALE_LABELS, LOCALES } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils/cn';
import type { Locale } from '@/types/api';

export interface LocaleSwitcherProps {
  /** `segmented` shows all three locales inline; `compact` collapses to a native select. */
  variant?: 'segmented' | 'compact';
  className?: string;
}

/**
 * Runtime language switcher. The choice is held in React state by `LocaleProvider` and
 * mirrored to `localStorage`, so switching never triggers a navigation or a refetch.
 */
export function LocaleSwitcher({ variant = 'segmented', className }: LocaleSwitcherProps): JSX.Element {
  const { locale, setLocale, t } = useTranslations();

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <Languages aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
        <select
          aria-label={t('locale.label')}
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
          className="h-9 w-full appearance-none rounded-xl border border-ink-200 bg-white py-0 pl-8 pr-3 text-xs font-medium text-ink-700 transition hover:border-ink-300"
        >
          {LOCALES.map((option) => (
            <option key={option} value={option}>
              {LOCALE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={t('locale.label')}
      className={cn('inline-flex rounded-xl border border-ink-200 bg-white/70 p-0.5', className)}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            className={cn(
              'rounded-[0.6rem] px-2.5 py-1 text-[0.72rem] font-medium transition',
              active ? 'bg-ink-900 text-white shadow-subtle' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {LOCALE_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
