import { motion } from 'framer-motion';
import { Calendar, Activity, Layers } from 'lucide-react';
import { TrendBadge } from './TrendBadge';
import { Stack } from '@/lib/api';
import { cn } from '@/lib/utils';

interface StackCardProps {
  stack: Stack;
  onClick?: () => void;
  delay?: number;
}

export function StackCard({ stack, onClick, delay = 0 }: StackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={cn(
        // Base: Pure Black background, standard border
        "rounded-xl p-5 cursor-pointer group transition-all duration-300",
        "bg-black border border-white/10",
        
        // Hover: Border becomes accent color with a subtle glow
        "hover:border-[#00fae0]/50 hover:shadow-[0_0_15px_-5px_rgba(0,250,224,0.2)]",
        
        // Left Border Indicator
        "border-l-4",
        // If growing, use Accent Color. If stable/down, use dark gray.
        stack.trend === 'growing' ? 'border-l-[#00fae0]' : 'border-l-zinc-700'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          {/* Title: White by default, Accent Color on hover */}
          <h3 className="text-lg font-semibold text-white group-hover:text-[#00fae0] transition-colors">
            {stack.name}
          </h3>
          <p className="text-sm text-zinc-400">{stack.category}</p>
        </div>
        <TrendBadge trend={stack.trend} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-xs">Daily Avg</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {stack.avg_daily_activity.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-500">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-xs">Total</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {stack.total_activity.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer / Meta Info */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
        <span className="flex items-center gap-1 hover:text-white transition-colors">
          <Calendar className="h-3 w-3" />
          {new Date(stack.last_trained).toLocaleDateString()}
        </span>
        
        {/* Tag: Dark semi-transparent white background */}
        <span className="bg-white/10 text-zinc-300 px-2 py-0.5 rounded border border-white/5">
          {stack.model_type}
        </span>
      </div>
    </motion.div>
  );
}