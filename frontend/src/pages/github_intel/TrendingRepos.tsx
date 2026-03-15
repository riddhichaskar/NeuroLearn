import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Grid, List } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RepoCard } from '@/components/dashboard/RepoCard';
import { mockRepositories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Core brand color
const ACCENT = "#00faee";

type SortOption = 'stars' | 'activity' | 'growth' | 'overall';
type ViewMode = 'grid' | 'list';

const TrendingRepos = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('overall');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const languages = useMemo(() => {
    const langs = new Set(mockRepositories.map(r => r.language));
    return ['all', ...Array.from(langs)];
  }, []);

  const filteredRepos = useMemo(() => {
    let repos = [...mockRepositories];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      repos = repos.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.topics.some(t => t.toLowerCase().includes(query))
      );
    }

    if (languageFilter !== 'all') {
      repos = repos.filter(r => r.language === languageFilter);
    }

    repos.sort((a, b) => {
      switch (sortBy) {
        case 'stars': return b.stars - a.stars;
        case 'activity': return b.activity_score - a.activity_score;
        case 'growth': return b.growth_rate - a.growth_rate;
        case 'overall':
        default: return b.overall_score - a.overall_score;
      }
    });

    return repos;
  }, [searchQuery, languageFilter, sortBy]);

  return (
    <DashboardLayout 
      title="Global Trending Index" 
      description="Neural scan of the most influential repositories in the ecosystem"
    >
      <div className="space-y-8 bg-black min-h-screen">
        {/* Search and Filters - Pure Dark Refactor */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row gap-4 p-1"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#00faee]" />
            <Input
              placeholder="Search repository index..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-[#0a0a0a] border-[#1a1a1a] text-zinc-200 focus-visible:ring-[#00faee50] rounded-xl"
            />
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[160px] bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 rounded-xl h-12 focus:ring-[#00faee50]">
                <Filter className="h-4 w-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-400">
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang} className="focus:bg-[#111] focus:text-[#00faee] uppercase text-[10px] font-bold">
                    {lang === 'all' ? 'Universal' : lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px] bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 rounded-xl h-12 focus:ring-[#00faee50]">
                <ArrowUpDown className="h-4 w-4 mr-2 text-zinc-500" />
                <SelectValue placeholder="Sort Priority" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-400">
                <SelectItem value="overall" className="uppercase text-[10px] font-bold">Intelligence Score</SelectItem>
                <SelectItem value="stars" className="uppercase text-[10px] font-bold">Total Stars</SelectItem>
                <SelectItem value="activity" className="uppercase text-[10px] font-bold">Active Velocity</SelectItem>
                <SelectItem value="growth" className="uppercase text-[10px] font-bold">Growth Vector</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden p-1 gap-1 h-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "rounded-lg w-10 transition-all",
                  viewMode === 'grid' ? "bg-[#111] text-[#00faee]" : "text-zinc-600 hover:text-zinc-300"
                )}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  "rounded-lg w-10 transition-all",
                  viewMode === 'list' ? "bg-[#111] text-[#00faee]" : "text-zinc-600 hover:text-zinc-300"
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tactical Feed - Pure Dark Refactor */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="h-2 w-2 rounded-full bg-[#00faee] animate-pulse" />
            <Badge className="bg-transparent border-[#1a1a1a] text-zinc-500 font-black uppercase text-[10px] tracking-widest py-1 px-3">
              Scanning: {filteredRepos.length} Operational Units Found
            </Badge>
            {languageFilter !== 'all' && (
              <Badge className="bg-[#00faee10] text-[#00faee] border-[#00faee20] uppercase text-[9px] font-black">
                Filtered: {languageFilter}
                <button 
                  onClick={() => setLanguageFilter('all')}
                  className="ml-2 hover:text-white transition-colors"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>

          <div className={cn(
            viewMode === 'grid' 
              ? "grid gap-6 md:grid-cols-2" 
              : "flex flex-col gap-4"
          )}>
            {filteredRepos.map((repo, index) => (
              <RepoCard 
                key={repo.id} 
                repo={repo} 
                index={index} 
                compact={viewMode === 'list'}
              />
            ))}
          </div>

          {filteredRepos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-24 border border-dashed border-[#1a1a1a] rounded-2xl"
            >
              <Search className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No Data Streams Found</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrendingRepos;