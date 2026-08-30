// frontend/src/lib/api/token-store.ts
import type { AuthTokens } from '@/types/auth';

const STORAGE_KEY = 'profile.admin.session';

/** Session shape persisted in `localStorage` between page loads. */
export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch milliseconds at which the access token stops being accepted. */
  expiresAt: number;
  username: string;
  displayName: string | null;
}

/**
 * @param tokens credential pair returned by the backend
 * @returns the session shape written to storage
 */
export function toStoredSession(tokens: AuthTokens): StoredSession {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresInSeconds * 1000,
    username: tokens.user.username,
    displayName: tokens.user.displayName ?? null,
  };
}

/** @returns the stored session, or `null` when absent, unreadable, or malformed */
export function readSession(): StoredSession | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as StoredSession).accessToken !== 'string' ||
      typeof (parsed as StoredSession).refreshToken !== 'string'
    ) {
      return null;
    }
    return parsed as StoredSession;
  } catch {
    return null;
  }
}

/** Persists the session, ignoring storage failures (private browsing, quota). */
export function writeSession(session: StoredSession): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage is a convenience here; the in-memory session still works for this tab.
  }
}

/** Removes the persisted session. */
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing actionable.
  }
}

/**
 * @param session stored session
 * @param skewMs treat the token as expired this many milliseconds early
 * @returns `true` when the access token should be refreshed before use
 */
export function isAccessTokenExpired(session: StoredSession, skewMs = 30_000): boolean {
  return session.expiresAt - skewMs <= Date.now();
}
