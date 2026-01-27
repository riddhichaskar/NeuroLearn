import { motion } from 'framer-motion';
import { Star, GitFork, Eye, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Repository } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ACCENT = "#00faee";

interface RepoCardProps {
  repo: Repository;
  index?: number;
  compact?: boolean;
}

// Updated sentiment to match the pure dark/cyan theme
const sentimentColors = {
  positive: `bg-[#00faee10] text-[#00faee] border-[#00faee30]`,
  neutral: 'bg-zinc-800/50 text-zinc-400 border-zinc-700',
  negative: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

const trendIcons = {
  rising: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

export function RepoCard({ repo, index = 0, compact = false }: RepoCardProps) {
  const TrendIcon = trendIcons[repo.trend];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#020202]",
        "hover:border-[#00faee50] hover:shadow-[0_0_30px_rgba(0,250,238,0.05)] transition-all duration-500",
        compact ? "p-4" : "p-6"
      )}
    >
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-4 min-w-0">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="h-10 w-10 rounded-lg border border-[#2a2a2a] grayscale group-hover:grayscale-0 transition-all"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-zinc-100 truncate group-hover:text-[#00faee] transition-colors tracking-tight">
                {repo.full_name}
              </h3>
              <a 
                href={repo.github_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="h-4 w-4 text-zinc-500 hover:text-[#00faee]" />
              </a>
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
              {repo.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="font-mono text-[10px] border-[#2a2a2a] text-zinc-400 bg-transparent">
            {repo.language}
          </Badge>
          <Badge className={cn("text-[10px] border uppercase tracking-wider font-bold", sentimentColors[repo.sentiment])}>
            {repo.sentiment}
          </Badge>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Star className="h-4 w-4 text-amber-400/80" />
          <span className="font-mono">{repo.stars.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <GitFork className="h-4 w-4" />
          <span className="font-mono">{repo.forks.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Eye className="h-4 w-4" />
          <span className="font-mono">{repo.watchers.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendIcon className={cn(
            "h-4 w-4",
            repo.trend === 'rising' && "text-[#00faee]",
            repo.trend === 'stable' && "text-zinc-600",
            repo.trend === 'declining' && "text-rose-500"
          )} />
          <span className={cn(
            "font-mono text-xs font-bold",
            repo.trend === 'rising' && "text-[#00faee]",
            repo.trend === 'stable' && "text-zinc-600",
            repo.trend === 'declining' && "text-rose-500"
          )}>
            {repo.growth_rate > 0 ? '+' : ''}{repo.growth_rate}%
          </span>
        </div>
      </div>

      {!compact && (
        <>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 5).map((topic) => (
              <Badge key={topic} className="text-[10px] bg-[#111] text-zinc-400 border-[#1a1a1a] hover:bg-[#1a1a1a] transition-colors">
                {topic}
              </Badge>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-[#161616]">
            <div>
              <p className="text-[10px] uppercase tracking-tighter text-zinc-600">Activity</p>
              <p className="font-mono text-sm font-medium text-zinc-300">{repo.activity_score}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-tighter text-zinc-600">Popularity</p>
              <p className="font-mono text-sm font-medium text-zinc-300">{repo.popularity_score}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-tighter text-zinc-600">Community</p>
              <p className="font-mono text-sm font-medium text-zinc-300">{repo.community_score}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-tighter text-zinc-600">Overall</p>
              <p className="font-mono text-sm font-bold" style={{ color: ACCENT }}>{repo.overall_score}</p>
            </div>
          </div>
        </>
      )}

      {/* Subtle corner glow */}
      <div 
        className="absolute -top-10 -right-10 h-32 w-32 blur-[60px] opacity-10 pointer-events-none" 
        style={{ backgroundColor: ACCENT }}
      />
    </motion.div>
  );
}