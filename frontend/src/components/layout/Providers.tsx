// frontend/src/components/layout/Providers.tsx
'use client';

import type { ReactNode } from 'react';
import { ToastProvider } from '@/lib/hooks/ToastProvider';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';

/**
 * Single client boundary at the root of the tree. Keeping both providers here means the
 * server components below stay server components — only this wrapper ships to the browser.
 */
export function Providers({ children }: { children: ReactNode }): JSX.Element {
  return (
    <LocaleProvider>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );
}
