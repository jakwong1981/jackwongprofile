// frontend/src/components/profile/ProfileHero.tsx
'use client';

/* eslint-disable @next/next/no-img-element -- avatars are operator-supplied absolute URLs on arbitrary hosts. */
import { MapPin } from 'lucide-react';
import { ContactLinks } from '@/components/profile/ContactLinks';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import type { Profile } from '@/types/profile';

export interface ProfileHeroProps {
  profile: Profile;
}

/**
 * Opening block of the public page: portrait, name, current title and employer, location,
 * and the contact chips. Stacks to a single centred column on phones.
 */
export function ProfileHero({ profile }: ProfileHeroProps): JSX.Element {
  const { tx } = useTranslations();

  const displayName = tx(profile.localizedFullName) || profile.fullName;
  const headline = tx(profile.headline);
  const jobTitle = tx(profile.jobTitle);
  const currentRole = [jobTitle, profile.companyName].filter((part) => part && part !== '').join(' · ');

  return (
    <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt={displayName}
          width={112}
          height={112}
          className="h-24 w-24 shrink-0 rounded-3xl border border-white/80 object-cover shadow-panel sm:h-28 sm:w-28"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/80 bg-white text-2xl font-semibold text-ink-300 shadow-panel sm:h-28 sm:w-28"
        >
          {displayName.slice(0, 1)}
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{displayName}</h1>
          {currentRole !== '' ? <p className="text-sm font-medium text-ink-600">{currentRole}</p> : null}
          {headline !== '' ? <p className="max-w-2xl text-sm leading-relaxed text-ink-500">{headline}</p> : null}
          {profile.location ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400 sm:justify-start">
              <MapPin aria-hidden className="h-3.5 w-3.5" />
              {profile.location}
            </p>
          ) : null}
        </div>

        <ContactLinks contact={profile.contact} className="justify-center sm:justify-start" />
      </div>
    </header>
  );
}
