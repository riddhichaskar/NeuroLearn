import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TechnologyCard } from '@/components/dashboard/TechnologyCard';
import { mockTechnologies } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * Pure Dark Theme Constants
 * Applying the #00faee accent color scheme
 */
const ACCENT_COLOR = "#00faee";
const DARK_SURFACE = "#020202";
const BORDER_COLOR = "#1a1a1a";

const Technologies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Memoize unique categories for the filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(mockTechnologies.map(t => t.category));
    return ['all', ...Array.from(cats)];
  }, []);

  // Filter Logic: Sorts by growth rate for the tactical view
  const filteredTechnologies = useMemo(() => {
    let techs = [...mockTechnologies];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      techs = techs.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      techs = techs.filter(t => t.category === categoryFilter);
    }

    return techs.sort((a, b) => b.growth_rate - a.growth_rate);
  }, [searchQuery, categoryFilter]);

  // Map data for the Adoption Intensity bar chart
  const chartData = useMemo(() => {
    return filteredTechnologies.slice(0, 10).map(tech => ({
      name: tech.name.toUpperCase(), // Standardized tactical casing
      repos: tech.repo_count,
      growth: tech.growth_rate,
      fillColor: tech.trend === 'rapid_growth' 
        ? ACCENT_COLOR 
        : tech.trend === 'growing' 
          ? `${ACCENT_COLOR}80` 
          : '#27272a' // Zinc-800 for muted states
    }));
  }, [filteredTechnologies]);

  return (
    <DashboardLayout 
      title="Technology Analytics" 
      description="Neural mapping of technology adoption and growth vectors"
    >
      <div className="space-y-8 bg-black min-h-screen">
        
        {/* Search and Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 p-1"
        >
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-[#00faee]" />
            <Input
              placeholder="Search technological nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] text-zinc-200 focus-visible:ring-[#00faee50] rounded-xl h-11 placeholder:text-zinc-700 transition-all"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-56 bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 rounded-xl h-11 uppercase text-[10px] font-black tracking-widest focus:ring-[#00faee50]">
              <SelectValue placeholder="Category Filter" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-400">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="focus:bg-[#111] focus:text-[#00faee] uppercase text-[10px] font-bold tracking-widest">
                  {cat === 'all' ? 'Universal Access' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Adoption Intensity Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ backgroundColor: DARK_SURFACE, borderColor: BORDER_COLOR }}
          className="rounded-2xl border p-8 shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Adoption Intensity</h3>
              <p className="text-[10px] font-bold text-zinc-600 uppercase mt-1">
                Displaying top {chartData.length} technical clusters
              </p>
            </div>
            <Badge className="bg-[#00faee10] text-[#00faee] border-[#00faee30] gap-2 py-1.5 px-4 font-black text-[9px] uppercase tracking-widest">
              <TrendingUp className="h-3 w-3" />
              Velocity Active
            </Badge>
          </div>

          <div className="h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#333" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#666" 
                  fontSize={10}
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontWeight: 700, fill: '#666' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{
                    backgroundColor: '#050505',
                    border: '1px solid #1a1a1a',
                    borderRadius: '12px',
                    fontSize: '10px',
                    color: '#fff',
                  }}
                  itemStyle={{ color: ACCENT_COLOR, fontWeight: 'bold' }}
                />
                <Bar dataKey="repos" radius={[0, 4, 4, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fillColor} 
                      style={{ 
                        filter: entry.fillColor === ACCENT_COLOR ? `drop-shadow(0 0 8px ${ACCENT_COLOR}40)` : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Background Decorative Glow */}
          <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-[#00faee]/5 blur-[100px] pointer-events-none" />
        </motion.div>

        {/* Telemetry Count */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00faee] animate-pulse shadow-[0_0_8px_#00faee]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
            System Scan: {filteredTechnologies.length} active streams identified
          </span>
        </div>

        {/* Technology Clusters Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-10">
          {filteredTechnologies.map((tech, index) => (
            <TechnologyCard key={tech.id} tech={tech} index={index} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Technologies;