import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Your core brand color
const ACCENT = "#00faee";

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function KPICard({ 
  label, 
  value, 
  change, 
  changeLabel, 
  trend = 'neutral', 
  icon,
  className,
  delay = 0 
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        /* Pure Dark Background & Subtle Border */
        "relative overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#020202] p-6",
        "hover:border-[#333] hover:shadow-[0_0_20px_rgba(0,250,238,0.05)] transition-all duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2">
          {/* Muted Text using Zinc for that Dark Mode feel */}
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
          
          <p className="text-3xl font-bold font-mono tracking-tighter text-white">
            {value}
          </p>

          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {/* Using the Accent color for the positive trend */}
              {trend === 'up' && <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />}
              {trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500" />}
              {trend === 'neutral' && <Minus className="h-4 w-4 text-zinc-600" />}
              
              <span className={cn(
                "text-sm font-semibold",
                trend === 'up' && `text-[${ACCENT}]`,
                trend === 'down' && "text-rose-500",
                trend === 'neutral' && "text-zinc-500"
              )}
              style={trend === 'up' ? { color: ACCENT } : {}}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              
              {changeLabel && (
                <span className="text-[10px] uppercase text-zinc-600 font-medium">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div 
            className="rounded-lg p-2.5 transition-colors"
            style={{ 
              backgroundColor: `${ACCENT}10`, // 10% Opacity
              color: ACCENT,
              border: `1px solid ${ACCENT}20`
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Futuristic Background Decoration */}
      <div 
        className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: ACCENT }} 
      />
      
      {/* Top light beam effect */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px] opacity-30"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` 
        }} 
      />
    </motion.div>
  );
}