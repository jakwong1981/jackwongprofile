// frontend/src/app/not-found.tsx
import Link from 'next/link';

/** 404 page. Deliberately static so it renders even when the backend is unreachable. */
export default function NotFound(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl font-semibold tracking-tight text-ink-200">404</p>
      <h1 className="text-lg font-semibold tracking-tight text-ink-900">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-500">
        The page you are looking for has moved or never existed.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-10 items-center rounded-xl bg-ink-900 px-4 text-sm font-medium text-white transition hover:bg-ink-800"
      >
        Back to profile
      </Link>
    </div>
  );
}
