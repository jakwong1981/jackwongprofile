// frontend/src/app/(site)/layout.tsx
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';

/** Chrome shared by the public-facing routes: sticky header, centred column, footer. */
export default function SiteLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
