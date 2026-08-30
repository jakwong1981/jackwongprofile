// frontend/src/components/ui/EmptyState.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional icon or illustration. */
  icon?: ReactNode;
  /** Optional call to action. */
  action?: ReactNode;
  className?: string;
}

/** Neutral placeholder shown wherever a collection has no rows to display. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ink-200 bg-white/50 px-6 py-10 text-center',
        className,
      )}
    >
      {icon ? <div className="text-ink-300">{icon}</div> : null}
      <p className="text-sm font-medium text-ink-700">{title}</p>
      {description ? <p className="max-w-sm text-xs leading-relaxed text-ink-400">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/** Simple centred spinner used while a client screen loads its first payload. */
export function LoadingState({ label }: { label: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-400">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-ink-300 border-t-transparent"
      />
      <span role="status">{label}</span>
    </div>
  );
}
