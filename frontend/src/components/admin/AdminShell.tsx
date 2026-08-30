// frontend/src/components/admin/AdminShell.tsx
'use client';

import { Award, Building2, GraduationCap, LayoutDashboard, LogOut, Newspaper, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/EmptyState';
import { useAdminSession } from '@/lib/hooks/useAdminSession';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import type { MessageKey } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils/cn';

/** Route that must render outside the authenticated shell. */
const LOGIN_PATH = '/admin/login';

interface AdminNavItem {
  href: string;
  labelKey: MessageKey;
  icon: LucideIcon;
}

const NAV_ITEMS: readonly AdminNavItem[] = [
  { href: '/admin', labelKey: 'admin.dashboard', icon: LayoutDashboard },
  { href: '/admin/profile', labelKey: 'admin.profileEditor', icon: UserCog },
  { href: '/admin/experience', labelKey: 'admin.experienceEditor', icon: Building2 },
  { href: '/admin/education', labelKey: 'admin.educationEditor', icon: GraduationCap },
  { href: '/admin/certifications', labelKey: 'admin.certificationEditor', icon: Award },
  { href: '/admin/news', labelKey: 'admin.newsConsole', icon: Newspaper },
] as const;

/**
 * Authenticated chrome for the administration portal: a sidebar at `lg` and above, a
 * horizontal scroller below it, plus the session controls.
 *
 * The sign-in route renders bare — wrapping it would redirect it to itself. The guard
 * here is a convenience only; every admin endpoint is independently authorised by the
 * backend, so a forged local session grants nothing.
 */
export function AdminShell({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
  const isLoginRoute = pathname === LOGIN_PATH;
  const { session, loading, signOut } = useAdminSession(!isLoginRoute);
  const { t } = useTranslations();

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return <LoadingState label={t('common.loading')} />;
  }

  if (session === null) {
    // `useAdminSession` has already scheduled the redirect; render nothing meanwhile.
    return <LoadingState label={t('common.loading')} />;
  }

  const isActive = (href: string): boolean => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-ink-50/85 backdrop-blur-glass">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="mr-auto truncate text-sm font-semibold tracking-tight text-ink-900">
            {t('app.title')}
          </Link>
          <span className="hidden truncate text-xs text-ink-400 sm:inline">
            {session.displayName ?? session.username}
          </span>
          <LocaleSwitcher variant="compact" className="w-32" />
          <Button size="sm" variant="ghost" icon={<LogOut aria-hidden className="h-3.5 w-3.5" />} onClick={signOut}>
            <span className="hidden sm:inline">{t('nav.signOut')}</span>
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:py-10">
        <nav aria-label="Admin sections" className="lg:w-56 lg:shrink-0">
          <ul className="scrollbar-slim flex gap-1.5 overflow-x-auto pb-1 lg:sticky lg:top-20 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="shrink-0 lg:w-full">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-[0.82rem] font-medium transition lg:w-full',
                    isActive(item.href)
                      ? 'bg-white text-ink-900 shadow-subtle'
                      : 'text-ink-500 hover:bg-white/60 hover:text-ink-900',
                  )}
                >
                  <item.icon aria-hidden className="h-4 w-4 shrink-0" />
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
