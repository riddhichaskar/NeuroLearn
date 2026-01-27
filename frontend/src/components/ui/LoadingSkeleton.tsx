import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'chart' | 'kpi';
}

export function LoadingSkeleton({ className, variant = 'text' }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn("glass-card rounded-xl p-6 animate-pulse", className)}>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-lg bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={cn("glass-card rounded-xl p-6 animate-pulse", className)}>
        <div className="h-6 w-32 rounded bg-muted mb-4" />
        <div className="h-64 w-full rounded-lg bg-muted flex items-end justify-around px-4 pb-4 gap-2">
          {[0.4, 0.7, 0.5, 0.8, 0.6, 0.9, 0.5].map((h, i) => (
            <div
              key={i}
              className="w-8 rounded-t bg-muted-foreground/10"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'kpi') {
    return (
      <div className={cn("glass-card rounded-xl p-6 animate-pulse", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-lg bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        <div className="h-8 w-24 rounded bg-muted mb-2" />
        <div className="h-3 w-20 rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn("h-4 rounded bg-muted animate-pulse", className)} />
  );
}

export function CardGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} variant="kpi" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <LoadingSkeleton variant="chart" className="h-80" />;
}
