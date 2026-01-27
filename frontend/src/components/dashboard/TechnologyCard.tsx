import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { Technology } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Your core brand color
const ACCENT = "#00faee";

interface TechnologyCardProps {
  tech: Technology;
  index?: number;
  showDetails?: boolean;
}

/**
 * Pure Dark Theme Adoption Stage Mapping
 * Using your #00faee for 'growing' stages and Zinc for stable/mainstream
 */
const adoptionStageStyles = {
  early_adopters: `bg-[#00faee20] text-[#00faee] border-[#00faee40] shadow-[0_0_15px_rgba(0,250,238,0.1)]`,
  early_majority: `bg-[#00faee15] text-[#00faee]/90 border-[#00faee30]`,
  late_majority: `bg-zinc-800/40 text-zinc-400 border-zinc-700/50`,
  mainstream: `bg-zinc-900 text-zinc-500 border-zinc-800`,
  emerging: `bg-[#00faee25] text-[#00faee] border-[#00faee] animate-pulse`,
};

const adoptionStageLabels = {
  early_adopters: 'Early Adopters',
  early_majority: 'Early Majority',
  late_majority: 'Late Majority',
  mainstream: 'Mainstream',
  emerging: 'Emerging',
};

const trendColors = {
  rapid_growth: `text-[#00faee]`,
  growing: `text-[#00faee]/80`,
  stable: 'text-zinc-500',
  declining: 'text-rose-500',
};

export function TechnologyCard({ tech, index = 0, showDetails = true }: TechnologyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        // High-end Pure Dark Container
        "group relative overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#020202] p-5",
        "hover:border-[#00faee40] hover:shadow-[0_0_30px_rgba(0,250,238,0.08)] transition-all duration-500"
      )}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-lg border transition-transform duration-300 group-hover:scale-110"
            style={{ 
              backgroundColor: `${ACCENT}10`, 
              color: ACCENT,
              borderColor: `${ACCENT}25` 
            }}
          >
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-100 group-hover:text-[#00faee] transition-colors tracking-tight">
              {tech.name}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold">{tech.category}</p>
          </div>
        </div>
        <Badge className={cn("text-[10px] border font-bold uppercase tracking-tighter transition-all", adoptionStageStyles[tech.adoption_stage])}>
          {adoptionStageLabels[tech.adoption_stage]}
        </Badge>
      </div>

      {/* Description */}
      {tech.description && (
        <p className="mt-4 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
          {tech.description}
        </p>
      )}

      {/* Details Grid */}
      {showDetails && (
        <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-[#111]">
          <div>
            <p className="text-[10px] uppercase text-zinc-600 font-black tracking-tighter">Repos</p>
            <p className="font-mono text-sm font-medium text-zinc-200">
              {tech.repo_count.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-600 font-black tracking-tighter">Avg Stars</p>
            <p className="font-mono text-sm font-medium text-zinc-200">
              {tech.avg_stars.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-zinc-600 font-black tracking-tighter">Growth</p>
            <div className="flex items-center gap-1">
              {tech.growth_rate > 10 ? (
                <TrendingUp className={cn("h-3 w-3", trendColors[tech.trend])} />
              ) : tech.growth_rate < 0 ? (
                <TrendingDown className={cn("h-3 w-3", trendColors[tech.trend])} />
              ) : (
                <Minus className={cn("h-3 w-3", trendColors[tech.trend])} />
              )}
              <span className={cn("font-mono text-sm font-bold", trendColors[tech.trend])}>
                {tech.growth_rate > 0 ? '+' : ''}{tech.growth_rate}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Confidence Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-[10px] uppercase font-black mb-2">
          <span className="text-zinc-600 tracking-widest">System Confidence</span>
          <span className="font-mono" style={{ color: ACCENT }}>
            {Math.round(tech.confidence * 100)}%
          </span>
        </div>
        <div className="h-1 bg-[#111] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tech.confidence * 100}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full"
            style={{ 
              backgroundColor: ACCENT,
              boxShadow: `0 0 12px ${ACCENT}60` 
            }}
          />
        </div>
      </div>

      {/* Aesthetic Light Source */}
      <div 
        className="absolute -bottom-12 -left-12 h-32 w-32 blur-[80px] opacity-[0.04] pointer-events-none" 
        style={{ backgroundColor: ACCENT }}
      />
    </motion.div>
  );
}