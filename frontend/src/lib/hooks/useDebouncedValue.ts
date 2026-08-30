// frontend/src/lib/hooks/useDebouncedValue.ts
'use client';

import { useEffect, useState } from 'react';

/** Debounce window mandated for editor inputs so typing never blocks the UI thread. */
export const EDITOR_DEBOUNCE_MS = 150;

/**
 * Returns a copy of `value` that only updates after it has stopped changing for `delayMs`.
 *
 * @param value   rapidly changing source value
 * @param delayMs quiet period before the change propagates
 * @returns the debounced value
 */
export function useDebouncedValue<T>(value: T, delayMs: number = EDITOR_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
