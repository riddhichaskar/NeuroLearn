import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Your core brand color
const ACCENT = "#00faee";

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg",
        // Using a dark slate base that complements the pure black background
        "bg-[#1a1a1a]", 
        className
      )}
      style={{
        // Adding a very subtle glow to the skeleton pulse
        boxShadow: `0 0 10px ${ACCENT}05` 
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#020202] p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <LoadingSkeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <LoadingSkeleton className="h-4 w-32" />
            <LoadingSkeleton className="h-3 w-48" />
          </div>
        </div>
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex gap-4">
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-16" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 bg-[#020202] border border-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="flex gap-4 p-4 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        {[1, 2, 3, 4, 5].map((i) => (
          <LoadingSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-[#0a0a0a] last:border-0">
          {[1, 2, 3, 4, 5].map((j) => (
            <LoadingSkeleton key={j} className="h-4 flex-1 opacity-50" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#020202] p-6">
      <div className="flex items-center justify-between mb-6">
        <LoadingSkeleton className="h-5 w-32" />
        <LoadingSkeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="h-64 flex items-end gap-2 p-4 border-l border-b border-[#1a1a1a]">
        {Array.from({ length: 7 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${30 + Math.random() * 60}%` }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex-1 rounded-t opacity-40"
            style={{ 
              backgroundColor: ACCENT,
              boxShadow: `0 0 15px ${ACCENT}20`
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function KPISkeleton() {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-[#020202] p-6">
      <LoadingSkeleton className="h-4 w-24 mb-3" />
      <LoadingSkeleton className="h-10 w-40 mb-3" />
      <LoadingSkeleton className="h-3 w-20" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-6 bg-[#000000] min-h-screen"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-4 w-96 opacity-60" />
        </div>
        <LoadingSkeleton className="h-12 w-36 rounded-xl" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
        </div>
      </div>
    </motion.div>
  );
}