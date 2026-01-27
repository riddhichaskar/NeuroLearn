import { Zap } from 'lucide-react';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';

interface TopNewsSectionProps {
  articles: Article[];
}

export const TopNewsSection = ({ articles }: TopNewsSectionProps) => {
  if (articles.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-impact-high/10">
          <Zap className="h-4 w-4 text-impact-high" />
        </div>
        <h2
          className="
            font-[var(--font-headline)]
            text-2xl md:text-2xl
            font-bold
            tracking-tight
            text-foreground
          "
        >Top Stories</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="featured" />
        ))}
      </div>
    </section>
  );
};
