// frontend/src/types/auth.ts

/** Non sensitive projection of an administrative account. */
export interface AdminUser {
  id: number;
  username: string;
  displayName?: string | null;
  role: string;
  lastLoginAt?: string | null;
}

/** Credential pair returned by the authentication endpoints. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AdminUser;
}

/** Sign-in payload. */
export interface LoginPayload {
  username: string;
  password: string;
}
