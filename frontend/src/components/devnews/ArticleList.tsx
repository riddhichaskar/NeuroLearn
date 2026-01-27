import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { Article } from '@/types/news';
import { ArticleCard } from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
}

export const ArticleList = ({ articles }: ArticleListProps) => {
  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Newspaper className="h-4 w-4 text-primary" />
        </div>
        <h2
          className="
            font-[var(--font-headline)]
            text-xl md:text-2xl
            font-bold
            tracking-tight
            text-foreground"
        > Latest News</h2>
        <span className="text-sm text-muted-foreground">
          ({articles.length})
        </span>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
      >
        {articles.map((article) => (
          <motion.div
            key={article.id}
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <ArticleCard article={article} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
