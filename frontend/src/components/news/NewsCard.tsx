// frontend/src/components/news/NewsCard.tsx
'use client';

import { ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Badge, impactTone } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateTime } from '@/lib/utils/date';
import type { NewsArticle } from '@/types/news';

export interface NewsCardProps {
  article: NewsArticle;
  /** Optional administrative controls rendered in the card footer. */
  actions?: JSX.Element;
}

/**
 * One aggregated article with its DeepSeek enrichment. Key points and the glossary are
 * collapsed behind a disclosure so a dense feed stays scannable.
 */
export function NewsCard({ article, actions }: NewsCardProps): JSX.Element {
  const { t, locale } = useTranslations();
  const [expanded, setExpanded] = useState(false);

  const keyPoints = article.keyPoints ?? [];
  const glossary = article.keywords ?? [];
  const hasDetail = keyPoints.length > 0 || glossary.length > 0;
  const body = article.summary ?? article.excerpt ?? '';

  return (
    <Card className="flex h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="accent">{article.sourceName}</Badge>
        {article.category ? <Badge>{article.category}</Badge> : null}
        {article.impactLevel ? (
          <Badge tone={impactTone(article.impactLevel)}>
            {t('news.impact')}: {article.impactLevel}
          </Badge>
        ) : null}
      </div>

      <h3 className="text-[0.95rem] font-semibold leading-snug tracking-tight text-ink-900">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-accent-600"
        >
          {article.title}
        </a>
      </h3>

      <p className="text-[0.7rem] tabular-nums text-ink-400">
        {[article.author, formatDateTime(article.publishedAt ?? article.fetchedAt, locale)]
          .filter((part) => part && part !== '')
          .join(' · ')}
      </p>

      {body !== '' ? <p className="text-sm leading-relaxed text-ink-600">{body}</p> : null}

      {hasDetail ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-accent-600 transition hover:text-accent-700"
          >
            <Sparkles aria-hidden className="h-3.5 w-3.5" />
            {expanded ? t('common.close') : t('news.keyPoints')}
          </button>

          {expanded ? (
            <div className="flex flex-col gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-3.5">
              {keyPoints.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <p className="section-label">{t('news.keyPoints')}</p>
                  <ul className="flex list-disc flex-col gap-1 pl-4 text-xs leading-relaxed text-ink-600 marker:text-ink-300">
                    {keyPoints.map((point, index) => (
                      <li key={`${article.id}-point-${index}`}>{point}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {glossary.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <p className="section-label">{t('news.glossary')}</p>
                  <dl className="flex flex-col gap-1 text-xs leading-relaxed">
                    {glossary.map((entry, index) => (
                      <div key={`${article.id}-term-${index}`} className="flex flex-wrap gap-x-1.5">
                        <dt className="font-medium text-ink-800">{entry.term}</dt>
                        <dd className="text-ink-500">— {entry.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 transition hover:text-ink-900"
        >
          {t('news.readOriginal')}
          <ExternalLink aria-hidden className="h-3 w-3" />
        </a>
        {actions}
      </div>
    </Card>
  );
}
