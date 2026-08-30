// frontend/src/components/markdown/SplitPaneEditor.tsx
'use client';

import { Columns2, Eye, PencilLine } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { countMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils/cn';

/** Which pane the mobile/tablet layout is showing. */
type MobilePane = 'editor' | 'preview';

export interface SplitPaneEditorProps {
  /** Markdown source held by the parent form. */
  value: string;
  onChange: (next: string) => void;
  label: string;
  placeholder?: string;
  /** Height of the panes at `lg` and above. */
  minHeightClass?: string;
  className?: string;
}

/**
 * Dual-column markdown workspace: source on the left, live preview on the right.
 *
 * Below `lg` the two panes collapse into a tabbed single column — a side-by-side layout
 * is unusable at phone widths. The preview reads a debounced copy of the source
 * ({@link useDebouncedValue}, 150 ms) so re-parsing never blocks keystrokes.
 */
export function SplitPaneEditor({
  value,
  onChange,
  label,
  placeholder,
  minHeightClass = 'lg:h-[26rem]',
  className,
}: SplitPaneEditorProps): JSX.Element {
  const { t } = useTranslations();
  const [mobilePane, setMobilePane] = useState<MobilePane>('editor');
  const debouncedValue = useDebouncedValue(value);
  const stats = useMemo(() => countMarkdown(value), [value]);

  return (
    <section className={cn('flex flex-col gap-2', className)} aria-label={label}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="section-label">{label}</span>

        <div className="flex items-center gap-3">
          <span className="hidden text-[0.7rem] tabular-nums text-ink-400 sm:inline">
            {stats.words} {t('admin.words')} · {stats.characters} {t('admin.characters')}
          </span>

          {/* Pane toggle is only meaningful while the panes are stacked. */}
          <div role="tablist" aria-label={label} className="inline-flex rounded-xl border border-ink-200 bg-white p-0.5 lg:hidden">
            <PaneTab
              active={mobilePane === 'editor'}
              onClick={() => setMobilePane('editor')}
              icon={<PencilLine aria-hidden className="h-3.5 w-3.5" />}
              label={t('admin.editor')}
            />
            <PaneTab
              active={mobilePane === 'preview'}
              onClick={() => setMobilePane('preview')}
              icon={<Eye aria-hidden className="h-3.5 w-3.5" />}
              label={t('admin.preview')}
            />
          </div>

          <Columns2 aria-hidden className="hidden h-4 w-4 text-ink-300 lg:block" />
        </div>
      </div>

      <div className={cn('grid gap-3 lg:grid-cols-2', minHeightClass)}>
        <div className={cn('flex min-h-[16rem] flex-col lg:h-full', mobilePane === 'editor' ? 'flex' : 'hidden lg:flex')}>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            aria-label={`${label} — ${t('admin.editor')}`}
            className="scrollbar-slim h-full w-full resize-none rounded-2xl border border-ink-200 bg-white p-4 font-mono text-[0.82rem] leading-6 text-ink-800 shadow-subtle transition placeholder:text-ink-300 hover:border-ink-300 focus:border-accent-400"
          />
        </div>

        <div
          className={cn(
            'min-h-[16rem] lg:h-full',
            mobilePane === 'preview' ? 'block' : 'hidden lg:block',
          )}
        >
          <div
            aria-live="polite"
            aria-label={`${label} — ${t('admin.preview')}`}
            className="scrollbar-slim h-full overflow-y-auto rounded-2xl border border-ink-200/70 bg-white/70 p-5 backdrop-blur-glass"
          >
            <MarkdownPreview source={debouncedValue} fallback={t('profile.empty')} />
          </div>
        </div>
      </div>

      <p className="text-[0.7rem] text-ink-400 sm:hidden">
        {stats.words} {t('admin.words')} · {stats.characters} {t('admin.characters')}
      </p>
    </section>
  );
}

function PaneTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: JSX.Element;
  label: string;
}): JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-[0.6rem] px-2.5 py-1 text-[0.72rem] font-medium transition',
        active ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-800',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
