// frontend/src/components/layout/SiteHeader.tsx
'use client';

import { Menu, Newspaper, ShieldCheck, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';
import type { MessageKey } from '@/lib/i18n/dictionaries';

interface NavItem {
  href: string;
  labelKey: MessageKey;
  icon: typeof User;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/', labelKey: 'nav.profile', icon: User },
  { href: '/news', labelKey: 'nav.news', icon: Newspaper },
  { href: '/admin', labelKey: 'nav.admin', icon: ShieldCheck },
] as const;

/**
 * Sticky public header. Collapses to a disclosure menu below `md`, which keeps the
 * language switcher reachable on phones without crowding the title.
 */
export function SiteHeader(): JSX.Element {
  const { t } = useTranslations();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Any navigation closes the mobile menu; without this it survives the route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string): boolean =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/60 bg-ink-50/80 backdrop-blur-glass">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink-900 focus:px-3 focus:py-1.5 focus:text-xs focus:text-white"
      >
        {t('nav.skipToContent')}
      </a>

      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="mr-auto truncate text-sm font-semibold tracking-tight text-ink-900">
          {t('app.title')}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[0.82rem] font-medium transition',
                isActive(item.href) ? 'bg-white text-ink-900 shadow-subtle' : 'text-ink-500 hover:text-ink-900',
              )}
            >
              <item.icon aria-hidden className="h-3.5 w-3.5" />
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <LocaleSwitcher className="hidden sm:inline-flex" />

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label="Menu"
          className="rounded-xl border border-ink-200 bg-white p-1.5 text-ink-600 transition hover:border-ink-300 md:hidden"
        >
          {menuOpen ? <X aria-hidden className="h-4 w-4" /> : <Menu aria-hidden className="h-4 w-4" />}
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-nav" className="border-t border-ink-200/70 bg-white/90 px-4 py-3 md:hidden">
          <nav aria-label="Primary mobile" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive(item.href) ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <item.icon aria-hidden className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>
          <LocaleSwitcher variant="compact" className="mt-3 sm:hidden" />
        </div>
      ) : null}
    </header>
  );
}
