import { useState, useCallback } from 'react';
import { FilterState } from '@/types/news';
import { useNews } from '@/hooks/useNews';
import { useTheme } from '@/hooks/useTheme';
import { Header } from './Header';
import { SidebarFilters } from './SidebarFilters';
import { TopNewsSection } from './TopNewsSection';
import { ArticleList } from './ArticleList';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

const initialFilters: FilterState = {
  source: null,
  sentiment: null,
  impact: null,
  category: null,
  sortBy: 'latest',
  search: '',
};

export const DevNewsPage = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const { articles, topNews, categories, sources, loading, error, refresh } = useNews(filters);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={filters.search}
        onSearchChange={handleSearchChange}
        onRefresh={refresh}
        isRefreshing={loading}
        theme={theme}
        onThemeToggle={toggleTheme}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      <div className="flex w-full">
        <main className="flex-1 p-4 lg:p-6 space-y-8">
        {/* Floating Filters */}
        <div className="sticky top-20 z-40 flex justify-center">
          <div className="w-full max-w-6xl px-4">
            <SidebarFilters
              categories={categories}
              sources={sources}
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={refresh} />
        ) : loading ? (
          <LoadingSkeleton />
        ) : articles.length === 0 ? (
          <EmptyState onClearFilters={clearFilters} />
        ) : (
          <>
            <TopNewsSection articles={topNews} />
            <ArticleList articles={articles} />
          </>
        )}
</main>

      </div>
    </div>
  );
};
