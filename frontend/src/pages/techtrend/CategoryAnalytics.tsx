import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CategoryCard } from '@/components/techtrend/CategoryCard';
import { TrendBadge } from '@/components/techtrend/TrendBadge';
import { CardGridSkeleton, ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/StateComponents';
import { fetchCategories, fetchCategoryTrends, Category, CategoryTrend } from '@/lib/api';
import { Layers, TrendingUp, Activity } from 'lucide-react';

const ACCENT_COLOR = '#00fae0';

export default function CategoryAnalytics() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryTrend, setCategoryTrend] = useState<CategoryTrend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendLoading, setIsTrendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detailRef = useRef<HTMLDivElement | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
      if (data.length > 0) {
        handleCategorySelect(data[0].name);
      }
    } catch {
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setIsTrendLoading(true);

    try {
      const trend = await fetchCategoryTrends(category);
      setCategoryTrend(trend);

      setTimeout(() => {
        detailRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 200);
    } catch {
      console.error('Failed to load category trends');
    } finally {
      setIsTrendLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadCategories} />;
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">Category Analytics</h1>
        <p className="text-zinc-400 mt-1">
          Deep dive into technology categories and their trends
        </p>
      </motion.div>

      {/* Categories */}
      {isLoading ? (
        <CardGridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.name}
              category={category}
              onClick={() => handleCategorySelect(category.name)}
              delay={index * 0.1}
              isActive={selectedCategory === category.name}
            />
          ))}
        </div>
      )}

      {/* Selected Category Section */}
      {selectedCategory && (
        <motion.div
          ref={detailRef}
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >

          {/* Indicator */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <div className="p-2.5 rounded-lg bg-[#00fae0]/10">
              <Layers className="h-6 w-6 text-[#00fae0]" />
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">
                {selectedCategory}
              </h2>
              <p className="text-zinc-400 text-sm">
                Showing analytics for this category
              </p>
            </div>
          </div>

          {isTrendLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
          ) : categoryTrend && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Chart */}
              <div className="bg-black border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-[#00fae0]" />
                  Top Stacks by Activity
                </h3>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryTrend.top_stacks} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                      <XAxis
                        type="number"
                        tickFormatter={(v) => v.toLocaleString()}
                        stroke="#52525b"
                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                      />

                      <YAxis
                        dataKey="name"
                        type="category"
                        width={80}
                        tick={{ fill: '#fff', fontSize: 12 }}
                        stroke="#52525b"
                      />

                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                          backgroundColor: '#000',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [
                          value.toLocaleString(),
                          'Daily Avg',
                        ]}
                      />

                      <Bar
                        dataKey="avg_daily_activity"
                        fill={ACCENT_COLOR}
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fastest Growing */}
              <div className="bg-black border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5 text-[#00fae0]" />
                  Fastest Growing
                </h3>

                <div className="space-y-4">
                  {categoryTrend.fastest_growing.map((stack, index) => (
                    <div
                      key={stack.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#00fae0]/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00fae0]/10 text-[#00fae0] font-bold text-sm">
                          {index + 1}
                        </span>

                        <div>
                          <p className="font-medium text-white">{stack.name}</p>
                          <p className="text-sm text-zinc-500">
                            {stack.avg_daily_activity.toLocaleString()} daily avg
                          </p>
                        </div>
                      </div>

                      <TrendBadge trend={stack.trend} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Table */}
          {categoryTrend && (
            <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">
                  All Stacks in {selectedCategory}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs text-zinc-400">Stack</th>
                      <th className="text-left px-6 py-4 text-xs text-zinc-400">Trend</th>
                      <th className="text-right px-6 py-4 text-xs text-zinc-400">Daily Avg</th>
                      <th className="text-right px-6 py-4 text-xs text-zinc-400">Total</th>
                      <th className="text-left px-6 py-4 text-xs text-zinc-400">Model</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {categoryTrend.stacks.map((stack) => (
                      <tr key={stack.name} className="hover:bg-white/5">
                        <td className="px-6 py-4 text-white">{stack.name}</td>

                        <td className="px-6 py-4">
                          <TrendBadge trend={stack.trend} size="sm" />
                        </td>

                        <td className="px-6 py-4 text-right text-zinc-200">
                          {stack.avg_daily_activity.toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right text-zinc-500">
                          {stack.total_activity.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs bg-white/10 px-2 py-1 rounded border border-white/5 text-zinc-300">
                            {stack.model_type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
}