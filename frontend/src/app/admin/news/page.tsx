// frontend/src/app/admin/news/page.tsx
'use client';

import { Download, Sparkles, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { NewsDashboard } from '@/components/news/NewsDashboard';
import { Badge, ingestionTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { toErrorMessage } from '@/lib/api/errors';
import { newsApi } from '@/lib/api/news';
import { useToast } from '@/lib/hooks/ToastProvider';
import { useTranslations } from '@/lib/i18n/LocaleProvider';
import { formatDateTime } from '@/lib/utils/date';
import type { NewsArticle, NewsIngestionRun } from '@/types/news';

/** How many pending articles one manual "analyse" pass will process. */
const ANALYZE_BATCH_SIZE = 20;

/**
 * News console. Wraps the same dashboard the public sees, adding ingestion controls, an
 * audit list of recent runs, and per-article analyse/delete actions.
 */
export default function AdminNewsPage(): JSX.Element {
  const { t, locale } = useTranslations();
  const { notify } = useToast();

  const [runs, setRuns] = useState<NewsIngestionRun[]>([]);
  const [ingesting, setIngesting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback((): void => setRefreshToken((token) => token + 1), []);

  const loadRuns = useCallback(async (): Promise<void> => {
    try {
      setRuns(await newsApi.recentRuns(8));
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    }
  }, [notify]);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns, refreshToken]);

  const handleIngest = async (): Promise<void> => {
    setIngesting(true);
    try {
      // An empty source list means "every enabled source" on the backend.
      const run = await newsApi.ingest([], true);
      notify(`${t('admin.ingestNow')} · ${run.status} · +${run.createdCount}`, 'success');
      refresh();
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    } finally {
      setIngesting(false);
    }
  };

  const handleAnalyzePending = async (): Promise<void> => {
    setAnalyzing(true);
    try {
      const result = await newsApi.analyzePending(ANALYZE_BATCH_SIZE);
      notify(`${t('admin.analyzePending')} · ${result.analyzed}`, 'success');
      refresh();
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeOne = async (article: NewsArticle): Promise<void> => {
    try {
      await newsApi.analyzeOne(article.id);
      notify(t('admin.saved'), 'success');
      refresh();
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    }
  };

  const handleDelete = async (article: NewsArticle): Promise<void> => {
    if (!window.confirm(t('admin.confirmDelete'))) {
      return;
    }
    try {
      await newsApi.remove(article.id);
      notify(t('admin.saved'), 'success');
      refresh();
    } catch (cause) {
      notify(toErrorMessage(cause), 'error');
    }
  };

  const renderActions = (article: NewsArticle): JSX.Element => (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        aria-label={t('admin.analyzePending')}
        onClick={() => void handleAnalyzeOne(article)}
      >
        <Sparkles aria-hidden className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="danger" aria-label={t('admin.delete')} onClick={() => void handleDelete(article)}>
        <Trash2 aria-hidden className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-ink-900">{t('admin.newsConsole')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            loading={ingesting}
            icon={<Download aria-hidden className="h-4 w-4" />}
            onClick={() => void handleIngest()}
          >
            {t('admin.ingestNow')}
          </Button>
          <Button
            variant="primary"
            loading={analyzing}
            icon={<Sparkles aria-hidden className="h-4 w-4" />}
            onClick={() => void handleAnalyzePending()}
          >
            {t('admin.analyzePending')}
          </Button>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="section-label">{t('admin.runs')}</h2>
        {runs.length === 0 ? (
          <EmptyState title={t('news.never')} />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[36rem] text-left text-xs">
              <thead className="border-b border-ink-200/70 text-[0.68rem] uppercase tracking-wide text-ink-400">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    {t('news.lastRun')}
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    {t('news.total')}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    {t('admin.add')}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    {t('news.analyzed')}
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">
                    {t('news.failed')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-ink-100 last:border-0">
                    <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-ink-600">
                      {formatDateTime(run.startedAt, locale)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={ingestionTone(run.status)}>{run.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{run.fetchedCount}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{run.createdCount}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{run.analyzedCount}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink-600">{run.failedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <NewsDashboard renderActions={renderActions} refreshToken={refreshToken} />
    </div>
  );
}
