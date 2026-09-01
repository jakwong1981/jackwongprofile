// frontend/src/lib/api/ssr-client.ts
// Simplified API client for SSR (Server-Side Rendering)

import type { Profile } from '@/types/profile';

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  traceId?: string;
  errors?: Array<{ field: string; message: string }>;
};

/**
 * Simplified API request for SSR - no Next.js-specific options
 */
async function apiRequestSSR<T>(path: string): Promise<T> {
  // Use environment variable or fallback
  const baseUrl = process.env.API_INTERNAL_BASE_URL || 'http://backend:8080/api/v1';
  const url = `${baseUrl.replace(/\/$/, '')}${path}`;
  
  try {
    // Use a simpler fetch without cache control that might cause issues
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      // Removed cache: 'no-store' to avoid Next.js dynamic usage error
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const text = await response.text();
    const json: ApiResponse<T> = JSON.parse(text);
    
    if (json.code !== 200) {
      throw new Error(`API error ${json.code}: ${json.message}`);
    }
    
    return json.data as T;
    
  } catch (err) {
    console.error('SSR API Error:', err);
    throw err;
  }
}

/**
 * SSR-specific profile API
 */
export const profileApiSSR = {
  getPublicProfile: (): Promise<Profile> => 
    apiRequestSSR<Profile>('/public/profile')
};
