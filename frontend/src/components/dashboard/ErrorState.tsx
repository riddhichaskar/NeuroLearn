import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Defining the accent color constant based on your hex
const ACCENT_COLOR = "#00faee";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'error' | 'empty' | 'offline';
  className?: string;
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  type = 'error',
  className
}: ErrorStateProps) {
  const icons = {
    error: AlertCircle,
    empty: AlertCircle,
    offline: WifiOff,
  };
  
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px] bg-[#0a0a0a] rounded-xl border border-[#1a1a1a]",
        className
      )}
    >
      {/* Icon Container with custom accent glow */}
      <div 
        className="rounded-full p-4 mb-6" 
        style={{ 
          backgroundColor: `${ACCENT_COLOR}15`, // 15% opacity
          border: `1px solid ${ACCENT_COLOR}30` 
        }}
      >
        <Icon className="h-10 w-10" style={{ color: ACCENT_COLOR }} />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      
      <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="gap-2 border-[#2a2a2a] bg-[#121212] text-zinc-100 hover:bg-[#1a1a1a] hover:text-white transition-all active:scale-95"
          style={{ borderColor: `${ACCENT_COLOR}40` }}
        >
          <RefreshCw className="h-4 w-4" style={{ color: ACCENT_COLOR }} />
          Try Again
        </Button>
      )}
    </motion.div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title = 'No data available',
  message = 'There is nothing to display at the moment.',
  icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]",
        className
      )}
    >
      {icon ? (
        <div className="mb-6 opacity-80" style={{ color: ACCENT_COLOR }}>
          {icon}
        </div>
      ) : (
        <div 
          className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center rotate-3"
          style={{ 
            backgroundColor: `${ACCENT_COLOR}10`,
            border: `1px dashed ${ACCENT_COLOR}50`
          }}
        >
          <AlertCircle className="h-8 w-8" style={{ color: ACCENT_COLOR }} />
        </div>
      )}

      <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-xs mb-8">{message}</p>

      {action && (
        <Button 
          onClick={action.onClick}
          className="px-8 py-6 font-bold uppercase tracking-wider text-xs transition-all hover:brightness-110"
          style={{ 
            backgroundColor: ACCENT_COLOR, 
            color: '#000',
            boxShadow: `0 10px 30px -10px ${ACCENT_COLOR}60`
          }}
        >
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}