// frontend/src/app/admin/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/** Wraps every `/admin/*` route in the authenticated shell. */
export default function AdminLayout({ children }: { children: ReactNode }): JSX.Element {
  return <AdminShell>{children}</AdminShell>;
}
