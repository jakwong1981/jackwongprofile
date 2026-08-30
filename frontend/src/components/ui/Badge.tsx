// frontend/src/components/ui/Badge.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import type { AnalysisStatus, ImpactLevel, IngestionStatus } from '@/types/news';

/** Colour families available to {@link Badge}. */
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'border-ink-200 bg-ink-50 text-ink-600',
  accent: 'border-accent-200 bg-accent-50 text-accent-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

/** Small pill used for categories, statuses, and impact levels. */
export function Badge({ children, tone = 'neutral', className }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.68rem] font-medium leading-5',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** @returns the tone conveying how significant an article is */
export function impactTone(level: ImpactLevel | null | undefined): BadgeTone {
  switch (level) {
    case 'CRITICAL':
      return 'danger';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'accent';
    case 'LOW':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/** @returns the tone conveying the DeepSeek enrichment state */
export function analysisTone(status: AnalysisStatus): BadgeTone {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'IN_PROGRESS':
      return 'accent';
    case 'PENDING':
      return 'warning';
    default:
      return 'neutral';
  }
}

/** @returns the tone conveying the outcome of an ingestion run */
export function ingestionTone(status: IngestionStatus): BadgeTone {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'PARTIAL':
      return 'warning';
    case 'FAILED':
      return 'danger';
    default:
      return 'accent';
  }
}
