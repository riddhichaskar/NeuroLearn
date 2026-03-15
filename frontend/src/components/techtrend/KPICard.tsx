import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: 'primary' | 'growing' | 'warning' | 'chart';
  delay?: number;
}

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'primary',
  delay = 0,
}: KPICardProps) {
  
  // Dynamic styles helper to handle the specific accent color
  const getIconStyles = (type: string) => {
    switch (type) {
      case 'primary':
      case 'chart':
        return { backgroundColor: `${ACCENT_COLOR}1a`, color: ACCENT_COLOR }; // 1a is approx 10% opacity hex
      case 'growing':
        return { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }; // Green-500
      case 'warning':
        return { backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }; // Yellow-500
      default:
        return { backgroundColor: `${ACCENT_COLOR}1a`, color: ACCENT_COLOR };
    }
  };

  const iconStyle = getIconStyles(iconColor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-xl p-6 transition-all duration-300",
        "bg-black border border-white/10",
        "hover:border-[#00fae0]/50 hover:shadow-[0_0_20px_-10px_rgba(0,250,224,0.3)]"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Icon Container */}
        <div 
          className="p-2.5 rounded-lg"
          style={iconStyle}
        >
          <Icon className="h-5 w-5" />
        </div>
        
        {/* Trend Indicator */}
        {trend && (
          <span
            className={cn(
              'text-sm font-medium',
              // Use accent color for positive, red for negative
              trend.isPositive ? 'text-[#00fae0]' : 'text-red-500'
            )}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        {/* Value: Pure White */}
        <h3 className="text-2xl font-bold tracking-tight text-white">
          {value !== undefined && value !== null 
            ? (typeof value === 'number' ? value.toLocaleString() : value) 
            : '—'}
        </h3>
        
        {/* Title: Muted Gray */}
        <p className="text-sm text-zinc-400">{title}</p>
        
        {/* Subtitle: Darker Gray */}
        {subtitle && (
          <p className="text-xs text-zinc-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}