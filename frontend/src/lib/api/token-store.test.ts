// frontend/src/lib/api/token-store.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSession,
  isAccessTokenExpired,
  readSession,
  toStoredSession,
  writeSession,
  type StoredSession,
} from '@/lib/api/token-store';
import type { AuthTokens } from '@/types/auth';

const STORAGE_KEY = 'profile.admin.session';

function session(overrides: Partial<StoredSession> = {}): StoredSession {
  return {
    accessToken: 'access',
    refreshToken: 'refresh',
    expiresAt: Date.now() + 60_000,
    username: 'admin',
    displayName: 'Site Administrator',
    ...overrides,
  };
}

describe('token-store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('toStoredSession', () => {
    it('derives an absolute expiry from the relative TTL', () => {
      const tokens: AuthTokens = {
        accessToken: 'a',
        refreshToken: 'r',
        tokenType: 'Bearer',
        expiresInSeconds: 3600,
        user: { id: 1, username: 'admin', displayName: 'Admin', role: 'ADMIN' },
      };
      const before = Date.now();
      const stored = toStoredSession(tokens);
      expect(stored.expiresAt).toBeGreaterThanOrEqual(before + 3_600_000);
      expect(stored.username).toBe('admin');
      expect(stored.displayName).toBe('Admin');
    });

    it('normalises an absent display name to null', () => {
      const tokens: AuthTokens = {
        accessToken: 'a',
        refreshToken: 'r',
        tokenType: 'Bearer',
        expiresInSeconds: 60,
        user: { id: 1, username: 'admin', role: 'ADMIN' },
      };
      expect(toStoredSession(tokens).displayName).toBeNull();
    });
  });

  describe('readSession', () => {
    it('round-trips a written session', () => {
      const value = session();
      writeSession(value);
      expect(readSession()).toEqual(value);
    });

    it('returns null when nothing is stored', () => {
      expect(readSession()).toBeNull();
    });

    it('returns null for unparseable JSON', () => {
      window.localStorage.setItem(STORAGE_KEY, '{not json');
      expect(readSession()).toBeNull();
    });

    it('returns null when the stored shape is wrong', () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: 42 }));
      expect(readSession()).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('removes the stored session', () => {
      writeSession(session());
      clearSession();
      expect(readSession()).toBeNull();
    });
  });

  describe('writeSession', () => {
    it('swallows storage failures rather than throwing', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => writeSession(session())).not.toThrow();
    });
  });

  describe('isAccessTokenExpired', () => {
    it('is false for a token comfortably in the future', () => {
      expect(isAccessTokenExpired(session({ expiresAt: Date.now() + 120_000 }))).toBe(false);
    });

    it('is true once the token has passed its expiry', () => {
      expect(isAccessTokenExpired(session({ expiresAt: Date.now() - 1 }))).toBe(true);
    });

    it('treats a token inside the clock-skew window as expired', () => {
      expect(isAccessTokenExpired(session({ expiresAt: Date.now() + 5_000 }))).toBe(true);
    });

    it('honours a custom skew', () => {
      expect(isAccessTokenExpired(session({ expiresAt: Date.now() + 5_000 }), 0)).toBe(false);
    });
  });
});
