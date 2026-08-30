// frontend/src/lib/api/news.ts
import { apiRequest } from '@/lib/api/client';
import type { PageResponse } from '@/types/api';
import type { NewsArticle, NewsIngestionRun, NewsQuery, NewsStats } from '@/types/news';

/** Every HTTP call to the news aggregator lives here. */
export const newsApi = {
  /**
   * @param query filter and paging parameters
   * @param signal optional abort signal for superseded searches
   * @returns one page of articles
   */
  search(query: NewsQuery, signal?: AbortSignal): Promise<PageResponse<NewsArticle>> {
    return apiRequest<PageResponse<NewsArticle>>('/api/v1/public/news', {
      query: {
        source: query.source,
        category: query.category,
        status: query.status,
        keyword: query.keyword,
        from: query.from,
        to: query.to,
        page: query.page ?? 0,
        size: query.size ?? 12,
      },
      ...(signal ? { signal } : {}),
    });
  },

  getById(id: number): Promise<NewsArticle> {
    return apiRequest<NewsArticle>(`/api/v1/public/news/${id}`);
  },

  stats(): Promise<NewsStats> {
    return apiRequest<NewsStats>('/api/v1/public/news/stats');
  },

  ingest(sourceKeys: string[], analyze: boolean): Promise<NewsIngestionRun> {
    return apiRequest<NewsIngestionRun>('/api/v1/admin/news/ingest', {
      method: 'POST',
      body: { sourceKeys, analyze },
      authenticated: true,
    });
  },

  analyzePending(limit: number): Promise<{ analyzed: number }> {
    return apiRequest<{ analyzed: number }>('/api/v1/admin/news/analyze', {
      method: 'POST',
      query: { limit },
      authenticated: true,
    });
  },

  analyzeOne(articleId: number): Promise<NewsArticle> {
    return apiRequest<NewsArticle>(`/api/v1/admin/news/${articleId}/analyze`, {
      method: 'POST',
      authenticated: true,
    });
  },

  remove(articleId: number): Promise<void> {
    return apiRequest<void>(`/api/v1/admin/news/${articleId}`, { method: 'DELETE', authenticated: true });
  },

  recentRuns(limit = 10): Promise<NewsIngestionRun[]> {
    return apiRequest<NewsIngestionRun[]>('/api/v1/admin/news/runs', {
      query: { limit },
      authenticated: true,
    });
  },
};
