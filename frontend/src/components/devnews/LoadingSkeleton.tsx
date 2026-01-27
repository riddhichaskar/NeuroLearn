import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ArticleCardSkeleton = () => (
  <Card className="border-border bg-card">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
    </CardHeader>
    <CardContent className="pb-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-5/6" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </CardContent>
    <CardFooter className="pt-0">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
    </CardFooter>
  </Card>
);

export const LoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Top News Skeleton */}
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </section>

    {/* Article List Skeleton */}
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </section>
  </div>
);
