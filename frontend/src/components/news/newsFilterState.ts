// frontend/src/components/news/newsFilterState.ts
import type { AnalysisStatus, NewsQuery } from '@/types/news';

/** Filter state owned by the news dashboard. */
export interface NewsFilterState {
  source: string;
  category: string;
  status: AnalysisStatus | '';
  keyword: string;
  page: number;
  size: number;
}

/** Actions accepted by {@link newsFilterReducer}. */
export type NewsFilterAction =
  | { type: 'source'; value: string }
  | { type: 'category'; value: string }
  | { type: 'status'; value: AnalysisStatus | '' }
  | { type: 'keyword'; value: string }
  | { type: 'page'; value: number }
  | { type: 'reset' };

/** Starting state: everything unfiltered, first page, twelve cards. */
export const INITIAL_NEWS_FILTERS: NewsFilterState = {
  source: '',
  category: '',
  status: '',
  keyword: '',
  page: 0,
  size: 12,
};

/**
 * Reduces filter changes. Every change other than paging resets the page to zero —
 * otherwise narrowing a filter can leave the view stranded past the last page.
 *
 * @param state current filters
 * @param action requested change
 * @returns the next filter state
 */
export function newsFilterReducer(state: NewsFilterState, action: NewsFilterAction): NewsFilterState {
  switch (action.type) {
    case 'source':
      return { ...state, source: action.value, page: 0 };
    case 'category':
      return { ...state, category: action.value, page: 0 };
    case 'status':
      return { ...state, status: action.value, page: 0 };
    case 'keyword':
      return { ...state, keyword: action.value, page: 0 };
    case 'page':
      return { ...state, page: Math.max(action.value, 0) };
    case 'reset':
      return { ...INITIAL_NEWS_FILTERS, size: state.size };
    default:
      return state;
  }
}

/**
 * Projects the UI filter state onto the query contract, dropping blank selections so the
 * backend receives no empty parameters.
 *
 * @param state current filters
 * @returns the query sent to `GET /api/v1/public/news`
 */
export function toNewsQuery(state: NewsFilterState): NewsQuery {
  const query: NewsQuery = { page: state.page, size: state.size };
  if (state.source !== '') {
    query.source = state.source;
  }
  if (state.category !== '') {
    query.category = state.category;
  }
  if (state.status !== '') {
    query.status = state.status;
  }
  const keyword = state.keyword.trim();
  if (keyword !== '') {
    query.keyword = keyword;
  }
  return query;
}

/** @returns `true` when at least one filter narrows the result set */
export function hasActiveFilters(state: NewsFilterState): boolean {
  return state.source !== '' || state.category !== '' || state.status !== '' || state.keyword.trim() !== '';
}
