// frontend/src/components/ui/Card.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Frosted surface used for every elevated block on the site. */
export function Card({ children, className }: CardProps): JSX.Element {
  return <div className={cn('glass-panel', className)}>{children}</div>;
}

export interface SectionProps {
  /** Anchor id, used by the in-page navigation. */
  id?: string;
  title: string;
  /** Optional count or status shown next to the heading. */
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * A titled block of the public profile. The heading uses a hairline rule rather than a
 * filled bar, which keeps the page quiet at desktop widths.
 */
export function Section({ id, title, meta, children, className }: SectionProps): JSX.Element {
  return (
    <section id={id} className={cn('scroll-mt-24', className)}>
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-ink-200/70 pb-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink-900 sm:text-xl">{title}</h2>
        {meta ? <span className="shrink-0 text-xs text-ink-400">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}
