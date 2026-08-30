// frontend/src/types/news.ts

/** Lifecycle of the DeepSeek enrichment attached to an article. */
export type AnalysisStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

/** Relative significance assigned by the analysis model. */
export type ImpactLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Outcome of one aggregation cycle. */
export type IngestionStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';

/** A domain term with a plain-language definition. */
export interface GlossaryTerm {
  term: string;
  definition: string;
}

/** One aggregated news item with its enrichment. */
export interface NewsArticle {
  id: number;
  sourceKey: string;
  sourceName: string;
  title: string;
  url: string;
  author?: string | null;
  publishedAt?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  keyPoints?: string[] | null;
  keywords?: GlossaryTerm[] | null;
  category?: string | null;
  impactLevel?: ImpactLevel | null;
  analysisStatus: AnalysisStatus;
  fetchedAt: string;
  analyzedAt?: string | null;
}

/** Audit summary of one aggregation cycle. */
export interface NewsIngestionRun {
  id: number;
  startedAt: string;
  finishedAt?: string | null;
  status: IngestionStatus;
  sourceCount: number;
  fetchedCount: number;
  createdCount: number;
  analyzedCount: number;
  failedCount: number;
  triggeredBy?: string | null;
  message?: string | null;
}

/** Per-source configuration and counters. */
export interface NewsSourceSummary {
  key: string;
  displayName: string;
  siteUrl: string;
  enabled: boolean;
  articleCount: number;
}

/** Counters powering the dashboard header. */
export interface NewsStats {
  totalArticles: number;
  analyzedArticles: number;
  pendingArticles: number;
  failedArticles: number;
  categories: string[];
  sources: NewsSourceSummary[];
  lastRun?: NewsIngestionRun | null;
}

/** Query parameters accepted by the article search endpoint. */
export interface NewsQuery {
  source?: string;
  category?: string;
  status?: AnalysisStatus;
  keyword?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
