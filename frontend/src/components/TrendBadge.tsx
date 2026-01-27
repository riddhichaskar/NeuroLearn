import { TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendBadgeProps {
  trend: 'growing' | 'stable';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export function TrendBadge({ trend, size = 'md', showIcon = true }: TrendBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const isGrowing = trend === 'growing';

  // Dynamic styles to handle the specific accent color
  const badgeStyle = isGrowing 
    ? { 
        backgroundColor: 'rgba(0, 250, 224, 0.1)', // 10% opacity version of #00fae0
        color: ACCENT_COLOR,
        border: `1px solid rgba(0, 250, 224, 0.2)` // Subtle border for pop
      }
    : {}; // Stable falls back to Tailwind classes

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full transition-colors border',
        sizeClasses[size],
        isGrowing
          ? '' // Styles handled inline for exact accent match
          : 'bg-white/5 text-zinc-400 border-white/10' // Neutral gray for stable
      )}
      style={badgeStyle}
    >
      {showIcon && (
        isGrowing ? (
          <TrendingUp size={iconSizes[size]} />
        ) : (
          <Minus size={iconSizes[size]} />
        )
      )}
      {isGrowing ? 'Growing' : 'Stable'}
    </span>
  );
}