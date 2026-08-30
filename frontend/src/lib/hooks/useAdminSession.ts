// frontend/src/lib/hooks/useAdminSession.ts
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { readSession, type StoredSession } from '@/lib/api/token-store';

/** Session state exposed to the administrative screens. */
export interface AdminSessionState {
  session: StoredSession | null;
  /** `true` until the first `localStorage` read has completed. */
  loading: boolean;
  signOut: () => void;
}

/**
 * Reads the persisted administrator session and redirects to the sign-in screen when
 * there is none. Kept deliberately simple: the JWT itself is the source of truth and the
 * backend re-validates every request.
 *
 * @param redirectWhenMissing navigate to `/admin/login` when no session exists
 * @returns the session state
 */
export function useAdminSession(redirectWhenMissing = true): AdminSessionState {
  const router = useRouter();
  const [session, setSession] = useState<StoredSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = readSession();
    setSession(current);
    setLoading(false);
    if (current === null && redirectWhenMissing) {
      router.replace('/admin/login');
    }
  }, [redirectWhenMissing, router]);

  const signOut = useCallback((): void => {
    authApi.logout();
    setSession(null);
    router.replace('/admin/login');
  }, [router]);

  return { session, loading, signOut };
}
