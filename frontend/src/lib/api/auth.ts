// frontend/src/lib/api/auth.ts
import { apiRequest } from '@/lib/api/client';
import { clearSession, toStoredSession, writeSession } from '@/lib/api/token-store';
import type { AdminUser, AuthTokens, LoginPayload } from '@/types/auth';

/** Authentication calls plus the session side effects they imply. */
export const authApi = {
  /**
   * Signs in and persists the resulting session.
   *
   * @param payload username and password
   * @returns the issued tokens and operator projection
   */
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const tokens = await apiRequest<AuthTokens>('/api/v1/auth/login', { method: 'POST', body: payload });
    writeSession(toStoredSession(tokens));
    return tokens;
  },

  me(): Promise<AdminUser> {
    return apiRequest<AdminUser>('/api/v1/auth/me', { authenticated: true });
  },

  /** Clears the local session. The backend holds no server-side state to invalidate. */
  logout(): void {
    clearSession();
  },
};
