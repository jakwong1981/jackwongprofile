// frontend/src/components/layout/SiteFooter.tsx
'use client';

import { useTranslations } from '@/lib/i18n/LocaleProvider';

/** Quiet footer carrying the tagline and the copyright line. */
export function SiteFooter(): JSX.Element {
  const { t } = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="no-print mt-16 border-t border-ink-200/70 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-1 px-4 text-center sm:px-6">
        <p className="text-xs text-ink-400">{t('app.tagline')}</p>
        <p className="text-[0.7rem] text-ink-300">© {year} Jack Wong</p>
      </div>
    </footer>
  );
}
