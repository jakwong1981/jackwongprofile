// frontend/src/components/admin/LocalizedField.tsx
'use client';

import { useState } from 'react';
import { TextAreaField, TextField } from '@/components/ui/Field';
import { LOCALE_LABELS, LOCALES, withTranslation } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils/cn';
import type { Locale, LocalizedText } from '@/types/api';

/**
 * Reads the translation stored for one locale.
 *
 * @param text   localised value, may be `null`
 * @param locale locale to read
 * @returns the stored string, or an empty string when that locale is unset
 */
export function readTranslation(text: LocalizedText | null | undefined, locale: Locale): string {
  if (!text) {
    return '';
  }
  if (locale === 'en') {
    return text.en ?? '';
  }
  if (locale === 'zh-Hant') {
    return text.zhHant ?? '';
  }
  return text.zhHans ?? '';
}

export interface LocalizedFieldProps {
  label: string;
  value: LocalizedText | null | undefined;
  onChange: (next: LocalizedText) => void;
  /** Renders a textarea instead of a single-line input. */
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  error?: string | undefined;
  className?: string;
}

/**
 * One field, three translations. A tab strip switches which locale is being edited while
 * the other two are preserved untouched — `withTranslation` never discards siblings.
 * A dot on a tab marks a locale that already has content.
 */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  error,
  className,
}: LocalizedFieldProps): JSX.Element {
  const [activeLocale, setActiveLocale] = useState<Locale>('zh-Hant');
  const current = readTranslation(value, activeLocale);

  const handleChange = (next: string): void => {
    onChange(withTranslation(value, activeLocale, next));
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-600">{label}</span>
        <div role="tablist" aria-label={label} className="inline-flex rounded-lg border border-ink-200 bg-white p-0.5">
          {LOCALES.map((option) => {
            const filled = readTranslation(value, option).trim() !== '';
            const active = option === activeLocale;
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveLocale(option)}
                className={cn(
                  'flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.68rem] font-medium transition',
                  active ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800',
                )}
              >
                {LOCALE_LABELS[option]}
                <span
                  aria-hidden
                  className={cn(
                    'h-1 w-1 rounded-full',
                    filled ? (active ? 'bg-emerald-300' : 'bg-emerald-500') : 'bg-transparent',
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {multiline ? (
        <TextAreaField
          label=""
          rows={rows}
          value={current}
          placeholder={placeholder}
          error={error}
          onChange={(event) => handleChange(event.target.value)}
          containerClassName="[&>label]:sr-only"
        />
      ) : (
        <TextField
          label=""
          value={current}
          placeholder={placeholder}
          error={error}
          onChange={(event) => handleChange(event.target.value)}
          containerClassName="[&>label]:sr-only"
        />
      )}
    </div>
  );
}
