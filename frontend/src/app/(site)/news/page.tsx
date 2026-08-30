// frontend/src/app/(site)/news/page.tsx
import type { Metadata } from 'next';
import { NewsDashboard } from '@/components/news/NewsDashboard';

export const metadata: Metadata = {
  title: 'AI News',
  description: 'Aggregated AI research and industry updates, summarised and classified by DeepSeek.',
};

/**
 * Public AI news dashboard. Rendered on the client because every interaction — filtering,
 * searching, paging — is a live query against the aggregator.
 */
export default function NewsPage(): JSX.Element {
  return <NewsDashboard />;
}
