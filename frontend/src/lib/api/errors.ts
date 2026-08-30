// frontend/src/lib/api/errors.ts
import type { FieldErrorDetail } from '@/types/api';

/**
 * Typed failure raised by every API helper. Carries the backend business code so callers
 * can branch on the reason without parsing message strings.
 */
export class ApiError extends Error {
  readonly code: number;
  readonly status: number;
  readonly errors: FieldErrorDetail[];
  readonly traceId?: string;

  constructor(params: {
    message: string;
    code: number;
    status: number;
    errors?: FieldErrorDetail[];
    traceId?: string;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.code = params.code;
    this.status = params.status;
    this.errors = params.errors ?? [];
    if (params.traceId !== undefined) {
      this.traceId = params.traceId;
    }
  }

  /** @returns `true` when the failure is an authentication problem the UI should react to. */
  get isAuthFailure(): boolean {
    return this.status === 401;
  }

  /**
   * @param field dotted field path
   * @returns the validation message for that field, when the backend reported one
   */
  messageFor(field: string): string | undefined {
    return this.errors.find((detail) => detail.field === field)?.message;
  }
}

/**
 * @param error unknown thrown value
 * @returns a human readable message, never `undefined`
 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error';
}
