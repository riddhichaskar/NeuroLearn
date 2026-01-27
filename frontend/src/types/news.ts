export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  source: 'hackernews' | 'devto' | 'github' | 'reddit';
  sourceUrl: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  tags: string[];
  engagementScore: number;
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon?: string;
}

export interface FilterState {
  source: string | null;
  sentiment: string | null;
  impact: string | null;
  category: string | null;
  sortBy: 'latest' | 'impact' | 'engagement';
  search: string;
}

export type Source = {
  id: string;
  name: string;
  icon: string;
  count: number;
};
