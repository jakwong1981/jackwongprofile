// frontend/src/app/admin/page.tsx
'use client';

import { Award, Building2, ExternalLink, GraduationCap, Newspaper, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { useAdminProfile } from '@/lib/hooks/useAdminProfile';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import type { MessageKey } from '@/lib/i18n/dictionaries';
import { formatDateTime } from '@/lib/utils/date';

/** Administrative landing page: content counters and shortcuts into each editor. */
export default function AdminDashboardPage(): JSX.Element {
  const { t, locale } = useTranslations();
  const { profile, loading, error } = useAdminProfile();

  if (loading) {
    return <LoadingState label={t('common.loading')} />;
  }

  if (error !== null || profile === null) {
    return <EmptyState title={t('common.error')} description={error ?? undefined} />;
  }

  const positionCount = profile.experiences.reduce((total, experience) => total + experience.positions.length, 0);

  const tiles: ReadonlyArray<{ href: string; labelKey: MessageKey; icon: LucideIcon; value: number }> = [
    { href: '/admin/experience', labelKey: 'admin.experienceEditor', icon: Building2, value: profile.experiences.length },
    { href: '/admin/education', labelKey: 'admin.educationEditor', icon: GraduationCap, value: profile.educations.length },
    {
      href: '/admin/certifications',
      labelKey: 'admin.certificationEditor',
      icon: Award,
      value: profile.certifications.length,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('admin.dashboard')}</h1>
          <p className="text-xs text-ink-400">
            {t('profile.lastUpdated')}: {formatDateTime(profile.updatedAt, locale)}
          </p>
        </div>
        <Badge tone={profile.published ? 'success' : 'warning'}>
          {profile.published ? t('admin.published') : t('common.optional')}
        </Badge>
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-semibold tracking-tight text-ink-900">{profile.fullName}</p>
          <p className="truncate text-xs text-ink-400">/{profile.slug}</p>
          <p className="text-xs text-ink-500">
            {positionCount} {t('admin.jobTitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/profile"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink-900 px-3.5 text-xs font-medium text-white transition hover:bg-ink-800"
          >
            <UserCog aria-hidden className="h-3.5 w-3.5" />
            {t('admin.profileEditor')}
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 text-xs font-medium text-ink-700 transition hover:border-ink-300"
          >
            <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            {t('nav.profile')}
          </Link>
        </div>
      </Card>

      <ul className="grid gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <li key={tile.href}>
            <Link href={tile.href} className="block h-full">
              <Card className="flex h-full flex-col gap-2 p-5 transition hover:border-accent-200 hover:shadow-panel">
                <tile.icon aria-hidden className="h-4 w-4 text-ink-300" />
                <span className="text-2xl font-semibold tabular-nums tracking-tight text-ink-900">{tile.value}</span>
                <span className="text-xs text-ink-500">{t(tile.labelKey)}</span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/admin/news" className="block">
        <Card className="flex items-center gap-3 p-5 transition hover:border-accent-200 hover:shadow-panel">
          <Newspaper aria-hidden className="h-4 w-4 text-ink-300" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-ink-900">{t('admin.newsConsole')}</span>
            <span className="text-xs text-ink-400">{t('news.subtitle')}</span>
          </div>
        </Card>
      </Link>
    </div>
  );
}
