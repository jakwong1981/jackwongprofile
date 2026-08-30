// frontend/src/lib/api/client.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, buildQueryString, resolveBaseUrl } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { writeSession } from '@/lib/api/token-store';
import type { ApiResponse } from '@/types/api';

/** Builds a `Response` carrying a backend envelope. */
function envelopeResponse<T>(envelope: Partial<ApiResponse<T>>, status = 200): Response {
  const body: ApiResponse<T> = {
    code: 200,
    message: 'OK',
    timestamp: '2024-01-01T00:00:00Z',
    ...envelope,
  };
  return new Response(JSON.stringify(body), { status });
}

describe('buildQueryString', () => {
  it('returns an empty string when there are no parameters', () => {
    expect(buildQueryString(undefined)).toBe('');
    expect(buildQueryString({})).toBe('');
  });

  it('serialises the populated parameters', () => {
    expect(buildQueryString({ page: 0, size: 12 })).toBe('?page=0&size=12');
  });

  it('drops null, undefined, and empty values', () => {
    expect(buildQueryString({ a: 'x', b: null, c: undefined, d: '' })).toBe('?a=x');
  });

  it('serialises booleans', () => {
    expect(buildQueryString({ analyze: false })).toBe('?analyze=false');
  });

  it('percent-encodes values', () => {
    expect(buildQueryString({ keyword: 'a b&c' })).toBe('?keyword=a+b%26c');
  });
});

describe('resolveBaseUrl', () => {
  it('strips a trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test/');
    expect(resolveBaseUrl()).toBe('http://api.test');
  });

  it('falls back to localhost when the variable is absent', () => {
    const original = process.env.NEXT_PUBLIC_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      expect(resolveBaseUrl()).toBe('http://localhost:8080');
    } finally {
      if (original !== undefined) {
        process.env.NEXT_PUBLIC_API_BASE_URL = original;
      }
    }
  });
});

describe('apiRequest', () => {
  const fetchMock = vi.fn<[RequestInfo | URL, RequestInit?], Promise<Response>>();

  beforeEach(() => {
    window.localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://api.test');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('unwraps the envelope and returns the data payload', async () => {
    fetchMock.mockResolvedValue(envelopeResponse({ data: { id: 1 } }));
    await expect(apiRequest<{ id: number }>('/api/v1/public/profile')).resolves.toEqual({ id: 1 });
  });

  it('targets the resolved base URL and appends the query string', async () => {
    fetchMock.mockResolvedValue(envelopeResponse({ data: [] }));
    await apiRequest('/api/v1/public/news', { query: { page: 1 } });
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.test/api/v1/public/news?page=1');
  });

  it('sends a JSON content type only when there is a body', async () => {
    // A Response body can only be read once, so each call needs its own instance.
    fetchMock.mockImplementation(() => Promise.resolve(envelopeResponse({ data: null })));

    await apiRequest('/x', { method: 'POST', body: { a: 1 } });
    const withBody = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(withBody['Content-Type']).toBe('application/json');

    fetchMock.mockClear();
    await apiRequest('/x');
    const withoutBody = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(withoutBody['Content-Type']).toBeUndefined();
  });

  it('throws an ApiError carrying the business code when the envelope reports a failure', async () => {
    fetchMock.mockResolvedValue(
      envelopeResponse({ code: 40401, message: 'Profile not found' }, 404),
    );
    await expect(apiRequest('/missing')).rejects.toMatchObject({
      name: 'ApiError',
      code: 40401,
      status: 404,
      message: 'Profile not found',
    });
  });

  it('surfaces field errors on the thrown ApiError', async () => {
    fetchMock.mockResolvedValue(
      envelopeResponse(
        { code: 40001, message: 'Validation failed', errors: [{ field: 'slug', message: 'invalid' }] },
        400,
      ),
    );
    await expect(apiRequest('/x', { method: 'POST', body: {} })).rejects.toSatisfy(
      (error: unknown) => error instanceof ApiError && error.messageFor('slug') === 'invalid',
    );
  });

  it('wraps a transport failure as an upstream ApiError', async () => {
    fetchMock.mockRejectedValue(new Error('connect ECONNREFUSED'));
    await expect(apiRequest('/x')).rejects.toMatchObject({ code: 50301, status: 0 });
  });

  it('treats an empty 204 body as a successful void response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiRequest('/x', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('refuses an authenticated call when there is no session', async () => {
    await expect(apiRequest('/admin', { authenticated: true })).rejects.toMatchObject({ code: 40101 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('attaches the bearer token when a live session exists', async () => {
    writeSession({
      accessToken: 'token-abc',
      refreshToken: 'refresh',
      expiresAt: Date.now() + 600_000,
      username: 'admin',
      displayName: null,
    });
    fetchMock.mockResolvedValue(envelopeResponse({ data: { ok: true } }));

    await apiRequest('/admin', { authenticated: true });
    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-abc');
  });

  it('exchanges an expired access token for a fresh one before the call', async () => {
    writeSession({
      accessToken: 'stale',
      refreshToken: 'refresh',
      expiresAt: Date.now() - 1,
      username: 'admin',
      displayName: null,
    });

    fetchMock
      .mockResolvedValueOnce(
        envelopeResponse({
          data: {
            accessToken: 'fresh',
            refreshToken: 'refresh-2',
            tokenType: 'Bearer',
            expiresInSeconds: 3600,
            user: { id: 1, username: 'admin', role: 'ADMIN' },
          },
        }),
      )
      .mockResolvedValueOnce(envelopeResponse({ data: { ok: true } }));

    await apiRequest('/admin', { authenticated: true });

    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.test/api/v1/auth/refresh');
    const headers = fetchMock.mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer fresh');
  });

  it('clears the session and fails when the refresh is rejected', async () => {
    writeSession({
      accessToken: 'stale',
      refreshToken: 'refresh',
      expiresAt: Date.now() - 1,
      username: 'admin',
      displayName: null,
    });
    fetchMock.mockResolvedValueOnce(envelopeResponse({ code: 40103, message: 'expired' }, 401));

    await expect(apiRequest('/admin', { authenticated: true })).rejects.toMatchObject({ code: 40101 });
    expect(window.localStorage.getItem('profile.admin.session')).toBeNull();
  });
});
