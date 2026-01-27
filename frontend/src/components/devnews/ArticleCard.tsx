import { useEffect, useState } from 'react';
import {
  Clock,
  ExternalLink,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Article } from '@/types/news';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured';
}

// THEME: #00FFFF (Cyan) for Sources
const sourceConfig = {
  hackernews: { name: 'Hacker News', icon: 'Y', color: 'bg-[#00FFFF]/20 text-[#00FFFF]' },
  devto: { name: 'Dev.to', icon: 'D', color: 'bg-[#00FFFF]/20 text-[#00FFFF]' },
  github: { name: 'GitHub', icon: 'G', color: 'bg-[#00FFFF]/20 text-[#00FFFF]' },
  reddit: { name: 'Reddit', icon: 'R', color: 'bg-[#00FFFF]/20 text-[#00FFFF]' },
};

// RESTORED: Impact colors kept exactly as before (original classes)
const impactConfig = {
  high: { label: 'High Impact', color: 'bg-impact-high text-primary-foreground' },
  medium: { label: 'Medium', color: 'bg-impact-medium text-primary-foreground' },
  low: { label: 'Low', color: 'bg-impact-low text-primary-foreground' },
};

// THEME: #00FFFF (Cyan) Glows
const sentimentGlow = {
  positive:
    'shadow-[0_0_22px_rgba(0,255,255,0.25)] dark:shadow-[0_0_14px_rgba(0,255,255,0.2)] border-[#00FFFF]/30',
  neutral:
    'shadow-[0_0_22px_rgba(0,255,255,0.15)] dark:shadow-[0_0_14px_rgba(0,255,255,0.1)] border-[#00FFFF]/20',
  negative:
    'shadow-[0_0_22px_rgba(0,255,255,0.15)] dark:shadow-[0_0_14px_rgba(0,255,255,0.1)] border-[#00FFFF]/20',
};

export const ArticleCard = ({ article, variant = 'default' }: ArticleCardProps) => {
  const source = sourceConfig[article.source];
  const impact = impactConfig[article.impact];
  const { toast } = useToast();

  /* ---------------- Parallax Tilt ---------------- */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-60, 60], [6, -6]);
  const rotateY = useTransform(x, [-60, 60], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  /* ---------------- Bookmark (localStorage) ---------------- */
  const storageKey = `saved-article-${article.id}`;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(localStorage.getItem(storageKey) === 'true');
  }, [storageKey]);

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    localStorage.setItem(storageKey, String(next));

    if (next) {
      toast({
        title: 'Saved',
        description: 'Article added to bookmarks',
        duration: 2000,
        className: 'border-[#00FFFF] text-[#00FFFF] bg-black',
      });
    }
  };

  /* ---------------- Reading Progress ---------------- */
  const progress = Math.min(article.readingTime * 12, 100);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="relative perspective-[1200px]"
    >
      <Card
        className={cn(
          'group relative rounded-2xl border',
          // Theme: Dark Background
          'bg-black/40 backdrop-blur-xl',
          'transition-shadow duration-300',
          sentimentGlow[article.sentiment],
          // Theme: Cyan Ring
          variant === 'featured' && 'ring-2 ring-[#00FFFF]/50'
        )}
      >
        {/* Bookmark */}
        <motion.button
          whileTap={{ scale: 0.7 }}
          whileHover={{ scale: 1.15 }}
          animate={
            saved
              // Theme: Cyan Shadow
              ? { scale: [1, 1.4, 1], boxShadow: '0 0 20px rgba(0, 255, 255, 0.8)' }
              : {}
          }
          transition={{ type: 'spring', stiffness: 400 }}
          onClick={toggleSave}
          className="absolute right-3 top-3 z-10"
        >
          <Bookmark
            className={cn(
              'h-5 w-5 transition-colors',
              // Theme: Cyan Fill/Text
              saved ? 'fill-[#00FFFF] text-[#00FFFF]' : 'text-gray-500 hover:text-[#00FFFF]'
            )}
          />
        </motion.button>

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold',
                  source.color
                )}
              >
                {source.icon}
              </div>
              <span className="text-sm text-gray-400">{source.name}</span>
            </div>
          </div>

          <h3 className="mt-2 font-semibold leading-tight text-gray-100 transition-colors group-hover:text-[#00FFFF]">
            {article.title}
          </h3>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Hover expand */}
          <motion.p
            initial={{ maxHeight: 72 }}
            whileHover={{ maxHeight: 160 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden text-sm text-gray-400"
          >
            {article.summary}
          </motion.p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                // Theme: Dark tag with Cyan hover
                className="rounded-full bg-white/5 text-gray-300 border border-white/10 hover:border-[#00FFFF]/50 hover:text-[#00FFFF]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#00FFFF]" />
                {article.readingTime} min
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#00FFFF]" />
                {article.engagementScore}
              </div>
              {/* RESTORED: Original Impact classes */}
              <Badge className={impact.color}>{impact.label}</Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="rounded-full text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10"
            >
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                Read <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};