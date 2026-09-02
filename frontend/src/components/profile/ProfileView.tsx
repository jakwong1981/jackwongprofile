// frontend/src/components/profile/ProfileView.tsx
'use client';

import { CertificationSection } from '@/components/profile/CertificationSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { Section } from '@/components/ui/Card';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { asLocalizedText } from '@/lib/i18n/locale';
import { formatDateTime } from '@/lib/utils/date';
import type { Profile } from '@/types/profile';

export interface ProfileViewProps {
  profile: Profile;
}

/**
 * The whole public profile. It is a client component purely so that switching language
 * re-renders the localised fields instantly — the data itself was fetched on the server
 * and is passed in as a prop, so no request is repeated in the browser.
 */
export function ProfileView({ profile }: ProfileViewProps): JSX.Element {
  const { t, tx, locale } = useTranslations();
  // The summary field may be corrupted in the DB: the actual multilingual JSON was stored
  // as a raw string inside the `en` slot of a LocalizedText wrapper.  We detect this by
  // checking whether the resolved string still looks like a JSON object, and if so we
  // parse it a second time before resolving the locale.
  const rawSummary = asLocalizedText(profile.summary as unknown as string);
  const resolvedOnce = tx(rawSummary);
  const summary = (() => {
    const trimmed = resolvedOnce.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const inner = JSON.parse(trimmed);
        if (inner !== null && typeof inner === 'object' && !Array.isArray(inner)) {
          return tx(inner as import('@/types/api').LocalizedText);
        }
      } catch {
        // Not JSON — use the string as-is
      }
    }
    return resolvedOnce;
  })();

  return (
    <div className="flex flex-col gap-12">
      <ProfileHero profile={profile} />

      {summary !== '' ? (
        <Section id="about" title={t('profile.about')}>
          {/* The biography is authored as GFM in the admin editor. */}
          <MarkdownPreview source={summary} />
        </Section>
      ) : null}

      <ExperienceSection experiences={profile.experiences} />
      <EducationSection educations={profile.educations} />
      <CertificationSection certifications={profile.certifications} />

      <p className="text-[0.7rem] text-ink-300">
        {t('profile.lastUpdated')}: {formatDateTime(profile.updatedAt, locale)}
      </p>
    </div>
  );
}
