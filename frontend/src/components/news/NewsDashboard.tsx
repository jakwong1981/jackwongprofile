// frontend/src/components/news/NewsDashboard.tsx
'use client';

import { Newspaper, RotateCcw, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { NewsCard } from '@/components/news/NewsCard';
import {
  INITIAL_NEWS_FILTERS,
  hasActiveFilters,
  newsFilterReducer,
  toNewsQuery,
} from '@/components/news/newsFilterState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { SelectField, TextField } from '@/components/ui/Field';
import { newsApi } from '@/lib/api/news';
import { toErrorMessage } from '@/lib/api/errors';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateTime } from '@/lib/utils/date';
import type { PageResponse } from '@/types/api';
import type { AnalysisStatus, NewsArticle, NewsStats } from '@/types/news';

/** Quiet period before a keystroke in the search box triggers a request. */
const SEARCH_DEBOUNCE_MS = 300;

const STATUS_OPTIONS: readonly AnalysisStatus[] = ['COMPLETED', 'PENDING', 'IN_PROGRESS', 'FAILED', 'SKIPPED'];

export interface NewsDashboardProps {
  /** Renders per-article administrative controls; omitted on the public page. */
  renderActions?: (article: NewsArticle) => JSX.Element;
  /** Bumping this value forces a refetch, e.g. after an admin triggers ingestion. */
  refreshToken?: number;
}

/**
 * AI news aggregator dashboard: filter bar, counters, and a responsive card grid.
 *
 * Filter state lives in a `useReducer` and all I/O goes through `newsApi`; the component
 * itself never calls `fetch`. In-flight searches are aborted when the filters change
 * again, so a fast typist cannot have an older response overwrite a newer one.
 */
export function NewsDashboard({ renderActions, refreshToken = 0 }: NewsDashboardProps): JSX.Element {
  const { t, locale } = useTranslations();

  const [filters, dispatch] = useReducer(newsFilterReducer, INITIAL_NEWS_FILTERS);
  const [page, setPage] = useState<PageResponse<NewsArticle> | null>(null);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedKeyword = useDebouncedValue(filters.keyword, SEARCH_DEBOUNCE_MS);

  // Only the debounced keyword participates in the request, so typing does not fan out.
  const query = useMemo(
    () => toNewsQuery({ ...filters, keyword: debouncedKeyword }),
    [filters, debouncedKeyword],
  );

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    newsApi
      .search(query, controller.signal)
      .then((result) => {
        if (active) {
          setPage(result);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (active && !controller.signal.aborted) {
          setError(toErrorMessage(cause));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [query, refreshToken]);

  useEffect(() => {
    let active = true;
    newsApi
      .stats()
      .then((result) => {
        if (active) {
          setStats(result);
        }
      })
      .catch(() => {
        // The counters are supplementary; the article grid stands on its own.
      });
    return () => {
      active = false;
    };
  }, [refreshToken]);

  const goToPage = useCallback((next: number) => {
    dispatch({ type: 'page', value: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const articles = page?.items ?? [];
  const totalPages = page?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{t('news.title')}</h1>
        <p className="text-sm text-ink-500">{t('news.subtitle')}</p>
      </header>

      {stats ? <StatsBar stats={stats} /> : null}

      <Card className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="section-label">{t('news.filters')}</span>
          {hasActiveFilters(filters) ? (
            <Button
              size="sm"
              variant="ghost"
              icon={<RotateCcw aria-hidden className="h-3.5 w-3.5" />}
              onClick={() => dispatch({ type: 'reset' })}
            >
              {t('news.clear')}
            </Button>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label={t('news.search')}
            placeholder={t('news.searchPlaceholder')}
            value={filters.keyword}
            onChange={(event) => dispatch({ type: 'keyword', value: event.target.value })}
            containerClassName="sm:col-span-2 lg:col-span-2"
          />

          <SelectField
            label={t('news.allSources')}
            value={filters.source}
            onChange={(event) => dispatch({ type: 'source', value: event.target.value })}
          >
            <option value="">{t('news.allSources')}</option>
            {(stats?.sources ?? []).map((source) => (
              <option key={source.key} value={source.key}>
                {source.displayName} ({source.articleCount})
              </option>
            ))}
          </SelectField>

          <SelectField
            label={t('news.allCategories')}
            value={filters.category}
            onChange={(event) => dispatch({ type: 'category', value: event.target.value })}
          >
            <option value="">{t('news.allCategories')}</option>
            {(stats?.categories ?? []).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectField>
        </div>

        {renderActions ? (
          <SelectField
            label={t('news.analyzed')}
            value={filters.status}
            onChange={(event) => dispatch({ type: 'status', value: event.target.value as AnalysisStatus | '' })}
            containerClassName="sm:max-w-xs"
          >
            <option value="">—</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </SelectField>
        ) : null}
      </Card>

      {error !== null ? (
        <EmptyState
          title={t('common.error')}
          description={error}
          icon={<Newspaper aria-hidden className="h-5 w-5" />}
          action={
            <Button size="sm" onClick={() => dispatch({ type: 'page', value: filters.page })}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : loading && page === null ? (
        <LoadingState label={t('news.loading')} />
      ) : articles.length === 0 ? (
        <EmptyState title={t('news.empty')} icon={<Search aria-hidden className="h-5 w-5" />} />
      ) : (
        <>
          <ul
            aria-busy={loading}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {articles.map((article) => (
              <li key={article.id}>
                <NewsCard article={article} {...(renderActions ? { actions: renderActions(article) } : {})} />
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
              <Button size="sm" disabled={filters.page <= 0} onClick={() => goToPage(filters.page - 1)}>
                {t('news.previous')}
              </Button>
              <span className="text-xs tabular-nums text-ink-500">
                {t('news.page')} {filters.page + 1} / {totalPages}
              </span>
              <Button
                size="sm"
                disabled={filters.page >= totalPages - 1}
                onClick={() => goToPage(filters.page + 1)}
              >
                {t('news.next')}
              </Button>
            </nav>
          ) : null}
        </>
      )}

      {stats?.lastRun ? (
        <p className="text-center text-[0.7rem] text-ink-300">
          {t('news.lastRun')}: {formatDateTime(stats.lastRun.startedAt, locale)} · {stats.lastRun.status}
        </p>
      ) : null}
    </div>
  );
}

function StatsBar({ stats }: { stats: NewsStats }): JSX.Element {
  const { t } = useTranslations();

  const tiles: ReadonlyArray<{ label: string; value: number }> = [
    { label: t('news.total'), value: stats.totalArticles },
    { label: t('news.analyzed'), value: stats.analyzedArticles },
    { label: t('news.pending'), value: stats.pendingArticles },
    { label: t('news.failed'), value: stats.failedArticles },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="flex flex-col gap-1 p-4">
          <span className="text-[0.68rem] uppercase tracking-wide text-ink-400">{tile.label}</span>
          <span className="text-xl font-semibold tabular-nums tracking-tight text-ink-900">{tile.value}</span>
        </Card>
      ))}
      {stats.sources.length > 0 ? (
        <div className="col-span-2 flex flex-wrap items-center gap-1.5 sm:col-span-4">
          {stats.sources.map((source) => (
            <Badge key={source.key} tone={source.enabled ? 'neutral' : 'warning'}>
              {source.displayName} · {source.articleCount}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
