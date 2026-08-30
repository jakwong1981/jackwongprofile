// frontend/src/types/api.ts

/** Locales supported for runtime switching. Mirrors `SupportedLocale` on the backend. */
export type Locale = 'en' | 'zh-Hant' | 'zh-Hans';

/** Multilingual text value object. Every translation is optional. */
export interface LocalizedText {
  en?: string | null;
  zhHant?: string | null;
  zhHans?: string | null;
}

/** Field level validation failure returned inside {@link ApiResponse}. */
export interface FieldErrorDetail {
  field: string;
  message: string;
}

/** Uniform envelope returned by every backend endpoint. */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data?: T;
  errors?: FieldErrorDetail[];
  traceId?: string;
  timestamp: string;
}

/** Transport projection of a Spring Data page. */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/** Business status codes emitted by the backend `ErrorCode` catalogue. */
export const API_CODE = {
  SUCCESS: 200,
  VALIDATION_FAILED: 40001,
  UNAUTHORIZED: 40101,
  INVALID_CREDENTIALS: 40102,
  TOKEN_EXPIRED: 40103,
  FORBIDDEN: 40301,
  RESOURCE_NOT_FOUND: 40401,
  RESOURCE_CONFLICT: 40901,
  OPTIMISTIC_LOCK: 40902,
  BUSINESS_RULE_VIOLATION: 42201,
  INTERNAL_ERROR: 50001,
  UPSTREAM_UNAVAILABLE: 50301,
} as const;

export type ApiCode = (typeof API_CODE)[keyof typeof API_CODE];
