import { useEffect, useRef, useState } from 'react';
import {
  TrendingUp,
  MessageCircle,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Category, FilterState, Source } from '@/types/news';
import { cn } from '@/lib/utils';

interface SidebarFiltersProps {
  categories: Category[];
  sources: Source[];
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

// THEME: Sentiments unified to Cyan per "no other color scene" rule
const sentiments = [
  { id: 'positive', label: 'Positive', color: 'bg-[#00FFFF]' },
  { id: 'neutral', label: 'Neutral', color: 'bg-[#00FFFF]/60' },
  { id: 'negative', label: 'Negative', color: 'bg-[#00FFFF]/30' },
];

// PRESERVED: Impact colors kept as requested in previous turn
const impacts = [
  { id: 'high', label: 'High Impact', color: 'bg-impact-high' },
  { id: 'medium', label: 'Medium', color: 'bg-impact-medium' },
  { id: 'low', label: 'Low', color: 'bg-impact-low' },
];

const sortOptions = [
  { id: 'latest', label: 'Latest', icon: Clock },
  { id: 'impact', label: 'Impact', icon: TrendingUp },
  { id: 'engagement', label: 'Engagement', icon: MessageCircle },
];

// THEME: Sources unified to Cyan
const sourceColors: Record<string, string> = {
  hackernews: 'bg-[#00FFFF]',
  devto: 'bg-[#00FFFF]',
  github: 'bg-[#00FFFF]',
  reddit: 'bg-[#00FFFF]',
};

export const SidebarFilters = ({
  categories,
  sources,
  filters,
  onFilterChange,
}: SidebarFiltersProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* -------- Outside click close -------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const clearFilters = () => {
    onFilterChange('source', null);
    onFilterChange('sentiment', null);
    onFilterChange('impact', null);
    onFilterChange('category', null);
  };

  const filterCount =
    Number(!!filters.category) +
    Number(!!filters.source) +
    Number(!!filters.sentiment) +
    Number(!!filters.impact);

  /* -------- Dropdown Component -------- */
  const Dropdown = ({
    id,
    label,
    active,
    children,
  }: {
    id: string;
    label: string;
    active?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm',
          'border border-white/10 backdrop-blur-xl',
          // Theme: Dark button background, Cyan hover
          'bg-black/40 hover:bg-[#00FFFF]/10 hover:border-[#00FFFF]/50 hover:text-[#00FFFF]',
          'transition-all text-gray-300',
          active &&
            // Theme: Active state Ring and Shadow set to Cyan
            'ring-2 ring-[#00FFFF]/50 shadow-[0_0_18px_rgba(0,255,255,0.25)] text-[#00FFFF] border-[#00FFFF]/50'
        )}
      >
        {label}

        {active && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            // Theme: Counter badge -> Cyan background, Black text
            className="ml-1 rounded-full bg-[#00FFFF] px-2 text-xs text-black font-bold"
          >
            1
          </motion.span>
        )}

        <motion.span animate={{ rotate: openDropdown === id ? 180 : 0 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {openDropdown === id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="
              absolute left-1/2 mt-4 w-64 -translate-x-1/2
              rounded-2xl border border-white/10
              bg-black/90 backdrop-blur-xl
              shadow-[0_0_30px_rgba(0,0,0,0.5)]
            "
          >
            <div className="p-2 space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    /* 🔹 OUTER WRAPPER (for outside click detection only) */
    <div ref={containerRef} className="sticky top-4 z-40 flex justify-center">
      {/* 🔹 THIS is where the requested className goes */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          mx-auto
          inline-flex
          flex-wrap
          justify-center
          items-center
          gap-3
          rounded-3xl
          border border-white/10
          bg-black/60
          p-4
          backdrop-blur-2xl
        "
      >
        <Dropdown id="sort" label="Sort" active={!!filters.sortBy}>
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onFilterChange('sortBy', option.id)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                filters.sortBy === option.id
                  // Theme: Active item -> Cyan background, Black text
                  ? 'bg-[#00FFFF] text-black font-medium'
                  : 'text-gray-400 hover:bg-[#00FFFF]/10 hover:text-[#00FFFF]'
              )}
            >
              <option.icon className="h-4 w-4" />
              {option.label}
            </button>
          ))}
        </Dropdown>

        <Dropdown id="category" label="Category" active={!!filters.category}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                onFilterChange(
                  'category',
                  filters.category === category.name ? null : category.name
                )
              }
              className={cn(
                'flex w-full justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                filters.category === category.name
                  ? 'bg-[#00FFFF] text-black font-medium'
                  : 'text-gray-400 hover:bg-[#00FFFF]/10 hover:text-[#00FFFF]'
              )}
            >
              <span>{category.name}</span>
              <span className={cn("text-xs", filters.category === category.name ? "opacity-100" : "opacity-50")}>
                {category.count}
              </span>
            </button>
          ))}
        </Dropdown>

        <Dropdown id="source" label="Source" active={!!filters.source}>
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() =>
                onFilterChange(
                  'source',
                  filters.source === source.id ? null : source.id
                )
              }
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                filters.source === source.id
                  ? 'bg-[#00FFFF] text-black font-medium'
                  : 'text-gray-400 hover:bg-[#00FFFF]/10 hover:text-[#00FFFF]'
              )}
            >
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-3 w-3 rounded-full',
                    // Note: Uses the updated sourceColors map (all Cyan)
                    filters.source === source.id ? 'bg-black' : sourceColors[source.id]
                  )}
                />
                {source.name}
              </div>
              <span className={cn("text-xs", filters.source === source.id ? "opacity-100" : "opacity-50")}>
                {source.count}
              </span>
            </button>
          ))}
        </Dropdown>

        <Dropdown id="sentiment" label="Sentiment" active={!!filters.sentiment}>
          {sentiments.map((sentiment) => (
            <button
              key={sentiment.id}
              onClick={() =>
                onFilterChange(
                  'sentiment',
                  filters.sentiment === sentiment.id ? null : sentiment.id
                )
              }
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                filters.sentiment === sentiment.id
                  ? 'bg-[#00FFFF] text-black font-medium'
                  : 'text-gray-400 hover:bg-[#00FFFF]/10 hover:text-[#00FFFF]'
              )}
            >
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  // Uses the updated sentiments map (Cyan variations)
                  filters.sentiment === sentiment.id ? 'bg-black' : sentiment.color
                )}
              />
              {sentiment.label}
            </button>
          ))}
        </Dropdown>

        <Dropdown id="impact" label="Impact" active={!!filters.impact}>
          {impacts.map((impact) => (
            <button
              key={impact.id}
              onClick={() =>
                onFilterChange(
                  'impact',
                  filters.impact === impact.id ? null : impact.id
                )
              }
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                // Theme: Active state is Cyan, but the DOTS preserve the Impact colors
                filters.impact === impact.id
                  ? 'bg-[#00FFFF] text-black font-medium'
                  : 'text-gray-400 hover:bg-[#00FFFF]/10 hover:text-[#00FFFF]'
              )}
            >
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  // Preserved impact colors for the dots
                  impact.color
                )}
              />
              {impact.label}
            </button>
          ))}
        </Dropdown>

        {filterCount > 0 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="rounded-full border border-white/10 text-gray-400 hover:text-[#00FFFF] hover:border-[#00FFFF] hover:bg-[#00FFFF]/10"
            >
              Clear ({filterCount})
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};