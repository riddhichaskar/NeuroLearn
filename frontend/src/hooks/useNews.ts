import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Article, Category, FilterState, Source } from '@/types/news';

const API_BASE = 'http://localhost:8001'; // change if deployed

// -----------------------------
// Backend → Frontend Normalizer
// -----------------------------
const mapArticle = (a: any): Article => ({
  id: a.id,
  title: a.title,
  content: a.content_preview ?? '',
  summary: a.summary,
  source: normalizeSource(a.source),
  sourceUrl: a.url,
  author: a.source,
  publishedAt: a.published_at,
  readingTime: a.reading_time,
  impact: a.impact,
  sentiment: a.sentiment,
  category: a.category ?? 'General',
  tags: a.tags ?? [],
  engagementScore: a.engagement_score ?? 0,
});

const normalizeSource = (source: string): Article['source'] => {
  const s = source.toLowerCase();
  if (s.includes('hacker')) return 'hackernews';
  if (s.includes('dev')) return 'devto';
  if (s.includes('github')) return 'github';
  if (s.includes('reddit')) return 'reddit';
  return 'hackernews';
};

// -----------------------------
// Hook
// -----------------------------
export const useNews = (filters: FilterState) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [topNews, setTopNews] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {};

      if (filters.source) params.source = filters.source;
      if (filters.sentiment) params.sentiment = filters.sentiment;
      if (filters.impact) params.impact = filters.impact;
      if (filters.category) params.category = filters.category;

      const [
        newsRes,
        topRes,
        sourcesRes,
        categoriesRes,
      ] = await Promise.all([
        axios.get(`${API_BASE}/api/news`, { params }),
        axios.get(`${API_BASE}/api/news/top`),
        axios.get(`${API_BASE}/api/news/sources`),
        axios.get(`${API_BASE}/api/news/categories`),
      ]);

      // ---- Articles
      let mappedArticles = newsRes.data.articles.map(mapArticle);

      // ---- Frontend search (backend doesn’t support it yet)
      if (filters.search) {
        const q = filters.search.toLowerCase();
        mappedArticles = mappedArticles.filter(
          a =>
            a.title.toLowerCase().includes(q) ||
            a.summary.toLowerCase().includes(q) ||
            a.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      // ---- Sorting
      if (filters.sortBy === 'latest') {
        mappedArticles.sort(
          (a, b) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime()
        );
      }

      if (filters.sortBy === 'impact') {
        const rank = { high: 0, medium: 1, low: 2 };
        mappedArticles.sort(
          (a, b) => rank[a.impact] - rank[b.impact]
        );
      }

      if (filters.sortBy === 'engagement') {
        mappedArticles.sort(
          (a, b) => b.engagementScore - a.engagementScore
        );
      }

      // ---- Top news
      const mappedTop = topRes.data.top_news.map(mapArticle);

      // ---- Sources
      const mappedSources: Source[] = sourcesRes.data.sources.map((s: any) => ({
        id: normalizeSource(s.key),
        name: s.name,
        icon: s.icon ?? s.name[0],
        count: s.article_count,
      }));

      // ---- Categories
      const mappedCategories: Category[] = Object.entries(
        categoriesRes.data.categories
      ).map(([name, count]) => ({
        id: name.toLowerCase(),
        name,
        count: count as number,
      }));

      setArticles(mappedArticles);
      setTopNews(mappedTop);
      setSources(mappedSources);
      setCategories(mappedCategories);
    } catch (e) {
      console.error(e);
      setError('Failed to load developer news.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/api/news/refresh`);
      fetchAll();
    } catch {
      setError('Refresh failed. Try again.');
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    articles,
    topNews,
    categories,
    sources,
    loading,
    error,
    refresh,
  };
};
