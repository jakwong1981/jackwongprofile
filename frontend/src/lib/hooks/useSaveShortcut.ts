// frontend/src/lib/hooks/useSaveShortcut.ts
'use client';

import { useEffect, useRef } from 'react';

/**
 * Binds ⌘S / Ctrl+S to a save handler and suppresses the browser's own "save page"
 * dialog. The handler is held in a ref so re-renders never re-register the listener.
 *
 * @param onSave  callback invoked on the shortcut
 * @param enabled set to `false` to unbind, e.g. while a modal owns the keyboard
 */
export function useSaveShortcut(onSave: () => void, enabled = true): void {
  const handlerRef = useRef(onSave);
  handlerRef.current = onSave;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const listener = (event: KeyboardEvent): void => {
      const isSaveCombo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's';
      if (!isSaveCombo) {
        return;
      }
      event.preventDefault();
      handlerRef.current();
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
