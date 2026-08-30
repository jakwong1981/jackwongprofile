// frontend/src/app/(site)/page.tsx
import type { Metadata } from 'next';
import { ProfileUnavailable } from '@/components/profile/ProfileUnavailable';
import { ProfileView } from '@/components/profile/ProfileView';
import { profileApi } from '@/lib/api/profile';
import { toPlainText } from '@/lib/markdown';
import { resolveLocalized } from '@/lib/i18n/locale';
import type { Profile } from '@/types/profile';

/** Seconds the rendered profile may be served from the Next.js data cache. */
const REVALIDATE_SECONDS = 60;

export const revalidate = REVALIDATE_SECONDS;

/**
 * Fetches the published profile, returning `null` instead of throwing so both the page
 * and its metadata can degrade gracefully when the backend is down.
 */
async function loadProfile(): Promise<Profile | null> {
  try {
    return await profileApi.getPublicProfile(REVALIDATE_SECONDS);
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await loadProfile();
  if (profile === null) {
    return { title: 'Profile' };
  }

  // Metadata is rendered on the server, before any client locale preference exists, so it
  // uses the English projection with the standard fallback chain.
  const title = profile.fullName;
  const description =
    toPlainText(resolveLocalized(profile.summary, 'en'), 160) || resolveLocalized(profile.headline, 'en');

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      title,
      description,
      ...(profile.avatarUrl ? { images: [{ url: profile.avatarUrl }] } : {}),
    },
  };
}

/** Public profile page — server-rendered, then hydrated for runtime locale switching. */
export default async function ProfilePage(): Promise<JSX.Element> {
  const profile = await loadProfile();

  if (profile === null) {
    return <ProfileUnavailable />;
  }

  return <ProfileView profile={profile} />;
}
