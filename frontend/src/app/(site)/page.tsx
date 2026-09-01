// frontend/src/app/(site)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import { ProfileUnavailable } from '@/components/profile/ProfileUnavailable';
import { ProfileView } from '@/components/profile/ProfileView';
import { profileApi } from '@/lib/api/profile';
import type { Profile } from '@/types/profile';

// Since we're using client component, generateMetadata doesn't work
// export async function generateMetadata(): Promise<Metadata> {
//   return { title: 'Profile' };
// }

/** Public profile page — client-rendered to avoid SSR issues */
export default function ProfilePage(): JSX.Element {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        // Use the regular API client (for browser)
        const data = await profileApi.getPublicProfile();
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Profile fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-10 text-center my-10">
            <div className="text-ink-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-loader-2 h-6 w-6 animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
            <p className="text-sm font-medium text-ink-700">載入個人檔案中...</p>
            <p className="max-w-sm text-xs leading-relaxed text-ink-400">請稍候。</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || profile === null) {
    return <ProfileUnavailable />;
  }

  return <ProfileView profile={profile} />;
}
