// frontend/src/lib/hooks/useAdminProfile.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { toErrorMessage } from '@/lib/api/errors';
import { profileApi } from '@/lib/api/profile';
import type { Profile } from '@/types/profile';

/** What every administrative editor needs to know about the profile it is editing. */
export interface AdminProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  /** Re-reads the profile from the API. */
  reload: () => Promise<void>;
  /** Replaces the cached profile after a successful write, avoiding a round trip. */
  setProfile: (next: Profile) => void;
}

/**
 * Loads the profile owned by the signed-in administrator. Every editor screen starts from
 * this single aggregate so the profile id never has to be threaded through the router.
 *
 * @returns the profile state and its controls
 */
export function useAdminProfile(): AdminProfileState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const result = await profileApi.getCurrentProfile();
      setProfile(result);
      setError(null);
    } catch (cause) {
      setError(toErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { profile, loading, error, reload: load, setProfile };
}
