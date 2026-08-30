// frontend/src/components/news/newsFilterState.test.ts
import { describe, expect, it } from 'vitest';
import {
  INITIAL_NEWS_FILTERS,
  hasActiveFilters,
  newsFilterReducer,
  toNewsQuery,
  type NewsFilterState,
} from '@/components/news/newsFilterState';

describe('newsFilterReducer', () => {
  it('applies each filter value', () => {
    expect(newsFilterReducer(INITIAL_NEWS_FILTERS, { type: 'source', value: 'THE_BATCH' }).source).toBe('THE_BATCH');
    expect(newsFilterReducer(INITIAL_NEWS_FILTERS, { type: 'category', value: 'Research' }).category).toBe('Research');
    expect(newsFilterReducer(INITIAL_NEWS_FILTERS, { type: 'status', value: 'FAILED' }).status).toBe('FAILED');
    expect(newsFilterReducer(INITIAL_NEWS_FILTERS, { type: 'keyword', value: 'agents' }).keyword).toBe('agents');
  });

  it('resets the page whenever a filter narrows the result set', () => {
    const onPageThree: NewsFilterState = { ...INITIAL_NEWS_FILTERS, page: 3 };
    expect(newsFilterReducer(onPageThree, { type: 'source', value: 'X' }).page).toBe(0);
    expect(newsFilterReducer(onPageThree, { type: 'category', value: 'X' }).page).toBe(0);
    expect(newsFilterReducer(onPageThree, { type: 'status', value: 'PENDING' }).page).toBe(0);
    expect(newsFilterReducer(onPageThree, { type: 'keyword', value: 'x' }).page).toBe(0);
  });

  it('changes the page without touching the filters', () => {
    const state: NewsFilterState = { ...INITIAL_NEWS_FILTERS, source: 'X' };
    const next = newsFilterReducer(state, { type: 'page', value: 2 });
    expect(next.page).toBe(2);
    expect(next.source).toBe('X');
  });

  it('clamps a negative page to zero', () => {
    expect(newsFilterReducer(INITIAL_NEWS_FILTERS, { type: 'page', value: -3 }).page).toBe(0);
  });

  it('clears every filter on reset while keeping the page size', () => {
    const dirty: NewsFilterState = { source: 'A', category: 'B', status: 'FAILED', keyword: 'c', page: 4, size: 24 };
    expect(newsFilterReducer(dirty, { type: 'reset' })).toEqual({ ...INITIAL_NEWS_FILTERS, size: 24 });
  });

  it('does not mutate the previous state', () => {
    const state = { ...INITIAL_NEWS_FILTERS };
    newsFilterReducer(state, { type: 'source', value: 'X' });
    expect(state.source).toBe('');
  });
});

describe('toNewsQuery', () => {
  it('always sends paging parameters', () => {
    expect(toNewsQuery(INITIAL_NEWS_FILTERS)).toEqual({ page: 0, size: 12 });
  });

  it('omits blank filters', () => {
    const query = toNewsQuery({ ...INITIAL_NEWS_FILTERS, source: '', category: '' });
    expect(query).not.toHaveProperty('source');
    expect(query).not.toHaveProperty('category');
  });

  it('includes the populated filters', () => {
    const query = toNewsQuery({
      source: 'THE_BATCH',
      category: 'Research',
      status: 'COMPLETED',
      keyword: 'agents',
      page: 2,
      size: 12,
    });
    expect(query).toEqual({
      page: 2,
      size: 12,
      source: 'THE_BATCH',
      category: 'Research',
      status: 'COMPLETED',
      keyword: 'agents',
    });
  });

  it('trims the keyword and drops it when only whitespace', () => {
    expect(toNewsQuery({ ...INITIAL_NEWS_FILTERS, keyword: '  agents  ' }).keyword).toBe('agents');
    expect(toNewsQuery({ ...INITIAL_NEWS_FILTERS, keyword: '   ' })).not.toHaveProperty('keyword');
  });
});

describe('hasActiveFilters', () => {
  it('is false for the initial state', () => {
    expect(hasActiveFilters(INITIAL_NEWS_FILTERS)).toBe(false);
  });

  it('is false when only the page has moved', () => {
    expect(hasActiveFilters({ ...INITIAL_NEWS_FILTERS, page: 3 })).toBe(false);
  });

  it('is true once any filter is set', () => {
    expect(hasActiveFilters({ ...INITIAL_NEWS_FILTERS, source: 'X' })).toBe(true);
    expect(hasActiveFilters({ ...INITIAL_NEWS_FILTERS, keyword: 'x' })).toBe(true);
  });

  it('ignores a whitespace-only keyword', () => {
    expect(hasActiveFilters({ ...INITIAL_NEWS_FILTERS, keyword: '   ' })).toBe(false);
  });
});
