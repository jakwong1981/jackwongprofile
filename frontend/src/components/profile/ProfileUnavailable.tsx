// frontend/src/components/profile/ProfileUnavailable.tsx
'use client';

import { CloudOff } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslations } from '@/lib/i18n/LocaleProvider';

/**
 * Shown when the public profile cannot be fetched. Rendering a calm, localised panel
 * rather than throwing keeps the site useful (header, language switcher, news tab) while
 * the backend is unreachable.
 */
export function ProfileUnavailable(): JSX.Element {
  const { t } = useTranslations();
  return (
    <EmptyState
      icon={<CloudOff aria-hidden className="h-6 w-6" />}
      title={t('profile.unavailableTitle')}
      description={t('profile.unavailableBody')}
      className="my-10"
    />
  );
}
