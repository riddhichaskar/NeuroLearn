import { SearchX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export const EmptyState = ({ onClearFilters }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">No articles found</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        We couldn't find any articles matching your current filters. Try adjusting your search
        criteria or clearing the filters.
      </p>
      <Button onClick={onClearFilters} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Clear filters
      </Button>
    </div>
  );
};
