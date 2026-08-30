// frontend/src/app/error.tsx
'use client';

import { useEffect } from 'react';

/**
 * Route-level error boundary. Next.js remounts the segment when `reset` is called, which
 * re-runs the failed data fetch.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): JSX.Element {
  useEffect(() => {
    // The digest is the only handle on the server-side stack, which Next.js withholds.
    console.error('Unhandled route error', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-lg font-semibold tracking-tight text-ink-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page could not be rendered. Retrying often resolves a transient backend failure.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-medium text-white transition hover:bg-ink-800"
      >
        Retry
      </button>
    </div>
  );
}
