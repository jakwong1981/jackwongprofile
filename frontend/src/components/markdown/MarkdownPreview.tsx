// frontend/src/components/markdown/MarkdownPreview.tsx
'use client';

import { useMemo } from 'react';
import { renderMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils/cn';

export interface MarkdownPreviewProps {
  /** GitHub Flavored Markdown source. */
  source: string | null | undefined;
  /** Rendered when the source is blank. */
  fallback?: string;
  className?: string;
}

/**
 * Renders GFM to HTML.
 *
 * Injecting the result is safe because `renderMarkdown` discards raw HTML outright and
 * strips any URL whose protocol is not http/https/mailto/tel — nothing in the output
 * originates from the source document except escaped text.
 */
export function MarkdownPreview({ source, fallback, className }: MarkdownPreviewProps): JSX.Element {
  const html = useMemo(() => renderMarkdown(source), [source]);

  if (html === '') {
    return <p className={cn('text-sm italic text-ink-300', className)}>{fallback ?? ''}</p>;
  }

  return <div className={cn('markdown-body', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
