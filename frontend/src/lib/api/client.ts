// frontend/src/lib/api/client.ts
import { ApiError } from '@/lib/api/errors';
import {
  clearSession,
  isAccessTokenExpired,
  readSession,
  toStoredSession,
  writeSession,
  type StoredSession,
} from '@/lib/api/token-store';
import type { ApiResponse } from '@/types/api';
import type { AuthTokens } from '@/types/auth';

/** Values accepted as query-string parameters. */
export type QueryValue = string | number | boolean | undefined | null;

/** Options accepted by {@link apiRequest}. */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Attach the administrator bearer token, refreshing it first when it has expired. */
  authenticated?: boolean;
  signal?: AbortSignal;
  /** Next.js fetch cache directive; defaults to `no-store` so admin data is never stale. */
  cache?: RequestCache;
  revalidateSeconds?: number;
}

/**
 * Resolves the API origin. The browser talks to the publicly reachable host while
 * server-side rendering can use the in-cluster service name.
 *
 * @returns an origin without a trailing slash
 */
export function resolveBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';
  if (typeof window !== 'undefined') {
    return stripTrailingSlash(publicUrl);
  }
  return stripTrailingSlash(process.env.API_INTERNAL_BASE_URL ?? publicUrl);
}

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/**
 * Serialises a query object, dropping `null`/`undefined`/empty values.
 *
 * @param query parameters
 * @returns a string starting with `?`, or an empty string
 */
export function buildQueryString(query: Record<string, QueryValue> | undefined): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    params.set(key, String(value));
  }
  const serialised = params.toString();
  return serialised === '' ? '' : `?${serialised}`;
}

async function parseEnvelope<T>(response: Response): Promise<ApiResponse<T>> {
  const text = await response.text();
  if (text === '') {
    return {
      code: response.ok ? 200 : response.status,
      message: response.statusText,
      timestamp: new Date().toISOString(),
    };
  }
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError({
      message: `Unreadable response from the API (HTTP ${response.status})`,
      code: response.status,
      status: response.status,
    });
  }
}

/**
 * Performs one API call and unwraps the {@link ApiResponse} envelope.
 *
 * @param path endpoint path beginning with `/`
 * @param options request options
 * @returns the `data` payload
 * @throws ApiError when the transport fails or the envelope reports a failure
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, authenticated = false, signal, cache, revalidateSeconds } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (authenticated) {
    const token = await ensureAccessToken();
    if (token === null) {
      throw new ApiError({ message: 'Not signed in', code: 40101, status: 401 });
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers,
    cache: cache ?? (revalidateSeconds === undefined ? 'no-store' : undefined),
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  if (signal) {
    init.signal = signal;
  }
  if (revalidateSeconds !== undefined) {
    init.next = { revalidate: revalidateSeconds };
  }

  let response: Response;
  try {
    response = await fetch(`${resolveBaseUrl()}${path}${buildQueryString(query)}`, init);
  } catch (cause) {
    throw new ApiError({
      message: cause instanceof Error ? cause.message : 'Network request failed',
      code: 50301,
      status: 0,
    });
  }

  const envelope = await parseEnvelope<T>(response);
  if (!response.ok || envelope.code !== 200) {
    if (response.status === 401 && authenticated) {
      clearSession();
    }
    throw new ApiError({
      message: envelope.message || `Request failed with HTTP ${response.status}`,
      code: envelope.code,
      status: response.status,
      errors: envelope.errors ?? [],
      ...(envelope.traceId !== undefined ? { traceId: envelope.traceId } : {}),
    });
  }

  return envelope.data as T;
}

/**
 * Returns a usable access token, transparently exchanging the refresh token when the
 * current one has expired.
 *
 * @returns the bearer token, or `null` when there is no valid session
 */
export async function ensureAccessToken(): Promise<string | null> {
  const session = readSession();
  if (session === null) {
    return null;
  }
  if (!isAccessTokenExpired(session)) {
    return session.accessToken;
  }
  const refreshed = await refreshSession(session);
  return refreshed?.accessToken ?? null;
}

async function refreshSession(session: StoredSession): Promise<StoredSession | null> {
  try {
    const response = await fetch(`${resolveBaseUrl()}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
      cache: 'no-store',
    });
    const envelope = await parseEnvelope<AuthTokens>(response);
    if (!response.ok || envelope.code !== 200 || !envelope.data) {
      clearSession();
      return null;
    }
    const next = toStoredSession(envelope.data);
    writeSession(next);
    return next;
  } catch {
    clearSession();
    return null;
  }
}
