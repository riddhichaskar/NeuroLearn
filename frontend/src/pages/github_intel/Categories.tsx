import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Star, Code, Tag } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockCategories } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Core accent color
const ACCENT = "#00faee";

const Categories = () => {
  const sortedCategories = useMemo(() => {
    return [...mockCategories].sort((a, b) => b.repo_count - a.repo_count);
  }, []);

  const totalRepos = useMemo(() => 
    mockCategories.reduce((sum, c) => sum + c.repo_count, 0), 
  []);

  const totalTopics = useMemo(() => 
    mockCategories.reduce((sum, c) => sum + c.topics.length, 0), 
  []);

  return (
    <DashboardLayout 
      title="Ecosystem Intelligence" 
      description="Mapping technology landscapes and repository clusters"
    >
      <div className="space-y-8 bg-black">
        
        {/* Stats Overview - Pure Dark Refactor */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: 'Total Categories', value: mockCategories.length, icon: Layers, delay: 0 },
            { label: 'Total Repositories', value: totalRepos.toLocaleString(), icon: Code, delay: 0.1 },
            { label: 'Total Topics', value: totalTopics, icon: Tag, delay: 0.2 },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-6 relative overflow-hidden group"
            >
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div 
                  className="rounded-xl p-2.5 transition-colors duration-500 group-hover:bg-[#00faee20]"
                  style={{ backgroundColor: `${ACCENT}10`, color: ACCENT }}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  {stat.label}
                </span>
              </div>
              <p className="text-4xl font-black font-mono tracking-tighter text-white relative z-10">
                {stat.value}
              </p>
              {/* Subtle background glow */}
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-[#00faee] opacity-[0.02] blur-2xl rounded-full" />
            </motion.div>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "group relative rounded-2xl border border-[#1a1a1a] bg-[#020202] p-6 overflow-hidden",
                "hover:border-[#00faee40] hover:shadow-[0_0_30px_rgba(0,250,238,0.05)] transition-all duration-500"
              )}
            >
              <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="max-w-[70%]">
                  <h3 className="font-black text-sm uppercase tracking-tight text-zinc-100 group-hover:text-[#00faee] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">
                    {category.description}
                  </p>
                </div>
                <Badge className="bg-transparent border-[#2a2a2a] text-zinc-400 font-mono text-[10px] py-0 px-2 group-hover:border-[#00faee50] group-hover:text-zinc-200">
                  {category.language}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest mb-6 relative z-10">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Code className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                  <span className="font-mono">{category.repo_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Star className="h-3.5 w-3.5 text-amber-500/80" />
                  <span className="font-mono text-zinc-300">{category.min_stars}+</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                {category.topics.map((topic) => (
                  <Badge key={topic} className="bg-[#0a0a0a] text-zinc-500 border-[#1a1a1a] text-[9px] font-black uppercase tracking-tighter hover:text-[#00faee] hover:border-[#00faee30]">
                    {topic}
                  </Badge>
                ))}
              </div>

              {/* Progress Bar / Density Refactor */}
              <div className="mt-auto pt-6 border-t border-[#111] relative z-10">
                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] mb-2.5">
                  <span className="text-zinc-600">Repository Density</span>
                  <span className="font-mono" style={{ color: ACCENT }}>
                    {((category.repo_count / 50000) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 bg-[#111] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((category.repo_count / 50000) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.05 + 0.3 }}
                    className="h-full rounded-full"
                    style={{ 
                        backgroundColor: ACCENT,
                        boxShadow: `0 0 10px ${ACCENT}50`
                    }}
                  />
                </div>
              </div>

              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 h-1 w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-transparent via-[#00faee30] to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Categories;