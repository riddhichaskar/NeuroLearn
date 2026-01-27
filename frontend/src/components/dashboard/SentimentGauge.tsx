import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Your core brand color
const ACCENT = "#00faee";

interface SentimentGaugeProps {
  score: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function SentimentGauge({ 
  score, 
  sentiment, 
  size = 'md',
  showLabel = true 
}: SentimentGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(1, score));
  const rotation = -90 + (normalizedScore * 180);
  
  const sizeClasses = {
    sm: 'w-24 h-12',
    md: 'w-40 h-20',
    lg: 'w-56 h-28',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  // Pure dark sentiment color mapping
  const sentimentColors = {
    positive: `text-[#00faee]`,
    neutral: 'text-zinc-500',
    negative: 'text-rose-500',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {/* Negative remains rose, Neutral is muted, Positive is your Cyan */}
              <stop offset="0%" stopColor="#f43f5e" /> 
              <stop offset="50%" stopColor="#3f3f46" />
              <stop offset="100%" stopColor={ACCENT} />
            </linearGradient>
            
            {/* Glow effect for the active arc */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Background track - Deep midnight gray */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#121212"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Colored arc with glow filter */}
          <motion.path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: normalizedScore }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
          
          {/* Needle - Pure white for high contrast against black */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: '50px 50px' }}
          >
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="18"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="3.5"
              fill="#ffffff"
              stroke="#000"
              strokeWidth="1"
            />
          </motion.g>
        </svg>
        
        {/* Score display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1">
          <span 
            className={cn("font-mono font-bold tracking-tighter", textSizes[size], sentimentColors[sentiment])}
            style={sentiment === 'positive' ? { textShadow: `0 0 15px ${ACCENT}50` } : {}}
          >
            {Math.round(normalizedScore * 100)}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <p className={cn(
          "mt-4 text-[10px] font-bold uppercase tracking-[0.2em]",
          sentimentColors[sentiment]
        )}>
          {sentiment}
        </p>
      )}
    </div>
  );
}