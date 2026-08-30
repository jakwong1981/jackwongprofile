// frontend/src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/layout/Providers';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Jack Wong — Profile',
    template: '%s · Jack Wong',
  },
  description: 'Full-stack engineering portfolio, professional experience, credentials, and an AI news dashboard.',
  applicationName: 'Jack Wong Profile',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'profile',
    title: 'Jack Wong — Profile',
    description: 'Full-stack engineering portfolio and AI news dashboard.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f6f6f7',
};

/**
 * Root layout. `lang` starts at the default locale and is corrected on the client by
 * `LocaleProvider` once the visitor's stored or browser preference is known.
 */
export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
