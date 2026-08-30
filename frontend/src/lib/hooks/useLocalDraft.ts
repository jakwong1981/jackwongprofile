// frontend/src/lib/hooks/useLocalDraft.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Autosave cadence required by the specification. */
export const AUTOSAVE_INTERVAL_MS = 2000;

/** Snapshot written to `localStorage`. */
interface DraftEnvelope<T> {
  savedAt: number;
  value: T;
}

/** What {@link useLocalDraft} exposes to the editor. */
export interface LocalDraft<T> {
  /** Epoch milliseconds of the last successful autosave, `null` before the first one. */
  lastSavedAt: number | null;
  /** Reads any draft persisted by an earlier session. */
  restore: () => T | null;
  /** Deletes the persisted draft, e.g. after a successful server save. */
  discard: () => void;
  /** Forces an immediate write instead of waiting for the next tick. */
  flush: () => void;
}

/**
 * Persists the current editor state to `localStorage` every {@link AUTOSAVE_INTERVAL_MS}
 * milliseconds, but only while the value differs from the last snapshot — an idle editor
 * performs no writes at all.
 *
 * @param storageKey key under which the draft is stored
 * @param value      current editor state
 * @param enabled    set to `false` to suspend autosaving
 * @returns draft controls
 */
export function useLocalDraft<T>(storageKey: string, value: T, enabled = true): LocalDraft<T> {
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const valueRef = useRef<T>(value);
  const serializedRef = useRef<string>('');

  valueRef.current = value;

  const write = useCallback((): void => {
    if (typeof window === 'undefined') {
      return;
    }
    let serialized: string;
    try {
      serialized = JSON.stringify(valueRef.current);
    } catch {
      return;
    }
    if (serialized === serializedRef.current) {
      return;
    }
    const envelope: DraftEnvelope<T> = { savedAt: Date.now(), value: valueRef.current };
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(envelope));
      serializedRef.current = serialized;
      setLastSavedAt(envelope.savedAt);
    } catch {
      // Quota exceeded or storage disabled: autosave degrades silently, editing continues.
    }
  }, [storageKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const timer = window.setInterval(write, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, write]);

  const restore = useCallback((): T | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw === null) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || !('value' in parsed)) {
        return null;
      }
      return (parsed as DraftEnvelope<T>).value;
    } catch {
      return null;
    }
  }, [storageKey]);

  const discard = useCallback((): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Nothing actionable.
    }
    serializedRef.current = '';
    setLastSavedAt(null);
  }, [storageKey]);

  return { lastSavedAt, restore, discard, flush: write };
}
