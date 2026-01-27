import { motion } from 'framer-motion';
import { Layers, Activity, TrendingUp, ChevronRight } from 'lucide-react';
import { Category } from '@/lib/api';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  delay?: number;
  isActive?: boolean;
}

export function CategoryCard({ category, onClick, delay = 0, isActive }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        // Base: Pure Black background with subtle white border
        "rounded-xl p-5 cursor-pointer group border transition-all duration-300",
        "bg-black border-white/10 hover:border-[#00fae0]/50",
        // Active State: Ring with the specific accent color
        isActive ? "ring-1 ring-[#00fae0] border-[#00fae0]" : ""
      )}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Icon Box: Accent color background with 10% opacity */}
        <div className="p-2.5 rounded-lg bg-[#00fae0]/10">
          <Layers className="h-5 w-5 text-[#00fae0]" />
        </div>
        
        {/* Chevron: Muted gray by default, Accent color on hover */}
        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-[#00fae0] group-hover:translate-x-1 transition-all" />
      </div>

      {/* Title: White text, Accent color on hover */}
      <h3 className="text-lg font-semibold mb-1 text-white group-hover:text-[#00fae0] transition-colors">
        {category.name}
      </h3>
      
      {/* Subtitle: Muted zinc */}
      <p className="text-sm text-zinc-400 mb-4">
        {category.stack_count} technologies
      </p>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-zinc-500">
            <Activity className="h-3 w-3" />
            <span className="text-xs">Total Activity</span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">
            {category.total_activity.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-zinc-500">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">Daily Avg</span>
          </div>
          <p className="text-sm font-semibold text-zinc-200">
            {category.avg_daily_activity.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}