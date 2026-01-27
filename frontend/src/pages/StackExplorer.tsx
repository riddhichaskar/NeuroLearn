import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StackCard } from '@/components/StackCard';
import { TrendBadge } from '@/components/TrendBadge';
import { CardGridSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState, EmptyState } from '@/components/ui/StateComponents';
import { fetchStacks, fetchCategories, Stack, Category } from '@/lib/api';

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export default function StackExplorer() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [trendFilter, setTrendFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stacksData, categoriesData] = await Promise.all([
        fetchStacks(),
        fetchCategories(),
      ]);
      setStacks(stacksData);
      setCategories(categoriesData);
    } catch {
      setError('Failed to load stacks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStacks = useMemo(() => {
    return stacks.filter((stack) => {
      const matchesSearch = stack.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || stack.category === categoryFilter;
      const matchesTrend = trendFilter === 'all' || stack.trend === trendFilter;
      return matchesSearch && matchesCategory && matchesTrend;
    });
  }, [stacks, searchTerm, categoryFilter, trendFilter]);

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Stack Explorer</h1>
        <p className="text-zinc-400 mt-1">
          Browse and filter all technology stacks
        </p>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-black border border-white/10 rounded-xl p-4 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-[#00fae0] transition-colors" />
            <Input
              placeholder="Search stacks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#00fae0] focus-visible:border-[#00fae0]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-black border-white/10 text-white focus:ring-[#00fae0]">
                <Filter className="h-4 w-4 mr-2 text-zinc-400" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/10 text-white">
                <SelectItem value="all" className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem 
                    key={cat.name} 
                    value={cat.name}
                    className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Trend Filter */}
            <Select value={trendFilter} onValueChange={setTrendFilter}>
              <SelectTrigger className="w-[140px] bg-black border-white/10 text-white focus:ring-[#00fae0]">
                <SelectValue placeholder="Trend" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/10 text-white">
                <SelectItem value="all" className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]">All Trends</SelectItem>
                <SelectItem value="growing" className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]">Growing</SelectItem>
                <SelectItem value="stable" className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]">Stable</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-white/5 border border-white/5 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`h-8 w-8 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-[#00fae0] text-black shadow-[0_0_10px_-2px_rgba(0,250,224,0.5)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={`h-8 w-8 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-[#00fae0] text-black shadow-[0_0_10px_-2px_rgba(0,250,224,0.5)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      {isLoading ? (
        <CardGridSkeleton count={8} />
      ) : filteredStacks.length === 0 ? (
        <div className="bg-black border border-white/10 rounded-xl p-12 text-center">
            <Search className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">No stacks found</h3>
            <p className="text-zinc-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStacks.map((stack, index) => (
            <StackCard
              key={stack.name}
              stack={stack}
              delay={index * 0.05}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-black border border-white/10 rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stack</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trend</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Avg</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Model</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Last Trained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredStacks.map((stack, index) => (
                  <motion.tr
                    key={stack.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-white group-hover:text-[#00fae0] transition-colors">
                      {stack.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{stack.category}</td>
                    <td className="px-6 py-4">
                      <TrendBadge trend={stack.trend} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-200">
                      {stack.avg_daily_activity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-zinc-500">
                      {stack.total_activity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-white/10 text-zinc-300 border border-white/5 px-2 py-1 rounded">
                        {stack.model_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      {new Date(stack.last_trained).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Footer / Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-sm text-zinc-500"
      >
        Showing {filteredStacks.length} of {stacks.length} stacks
      </motion.div>
    </div>
  );
}