// frontend/src/components/profile/ProfileView.tsx
'use client';

import { CertificationSection } from '@/components/profile/CertificationSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { Section } from '@/components/ui/Card';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
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
  const summary = tx(profile.summary);

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
