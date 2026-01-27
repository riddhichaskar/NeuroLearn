import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Layers,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { TrendBadge } from '@/components/TrendBadge';
import { CardGridSkeleton, ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/StateComponents';
import { fetchDashboard, DashboardData } from '@/lib/api';

// Updated Color Palette starting with your Accent Color (#00fae0)
// and fading into cool tones that look great on pure black.
const ACCENT_COLOR = '#00fae0';
const COLORS = [
  ACCENT_COLOR, // Main Accent
  '#06b6d4',    // Cyan-500
  '#3b82f6',    // Blue-500
  '#6366f1',    // Indigo-500
  '#8b5cf6',    // Violet-500
  '#d946ef',    // Fuchsia-500
];

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboard();
      setData(result);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Technology ecosystem overview and key metrics
        </p>
      </motion.div>

      {/* KPI Cards Grid */}
      {isLoading ? (
        <CardGridSkeleton count={5} />
      ) : data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total Stacks"
            value={data.total_stacks ?? 0}
            icon={Layers}
            iconColor="primary"
            delay={0}
          />
          <KPICard
            title="Categories"
            value={data.total_categories ?? 0}
            icon={BarChart3}
            iconColor="chart"
            delay={0.1}
          />
          <KPICard
            title="Total Activity"
            value={data.total_activity ?? 0}
            subtitle="All-time"
            icon={Activity}
            iconColor="growing"
            delay={0.2}
          />
          <KPICard
            title="Growing Stacks"
            value={data.growing_stacks_count ?? 0}
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            iconColor="growing"
            delay={0.3}
          />
          <KPICard
            title="Avg Daily Activity"
            value={data.avg_daily_activity ?? 0}
            icon={Zap}
            iconColor="warning"
            delay={0.4}
          />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : data && (
          <>
            {/* Top Growing Stacks Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 bg-black border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Top Growing Stacks</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={(data.top_growing_stacks || []).slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(v) => v.toLocaleString()} 
                      stroke="#52525b" // zinc-600
                      tick={{ fill: '#a1a1aa', fontSize: 12 }} // zinc-400
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80} 
                      tick={{ fill: '#fff', fontSize: 12, fontWeight: 500 }}
                      stroke="#52525b"
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                      }}
                      itemStyle={{ color: ACCENT_COLOR }}
                      formatter={(value: number) => [value.toLocaleString(), 'Daily Activity']}
                    />
                    <Bar dataKey="avg_daily_activity" radius={[0, 4, 4, 0]} barSize={24}>
                      {/* We use the updated COLORS array here. 
                         The first bar will be your accent color.
                      */}
                      {(data.top_growing_stacks || []).slice(0, 8).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Category Distribution Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-black border border-white/10 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-white">Category Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.category_distribution || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="rgba(0,0,0,1)" // Black stroke to separate segments
                      strokeWidth={2}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(data.category_distribution || []).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      itemStyle={{ color: ACCENT_COLOR }}
                      formatter={(value: number) => [value.toLocaleString(), 'Activity']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Detailed Table Section */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-black border border-white/10 rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Top Growing Technologies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rank</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stack</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trend</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Avg</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {(data.top_growing_stacks || []).slice(0, 10).map((stack, index) => (
                  <motion.tr
                    key={stack.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="group hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#00fae0]/10 text-[#00fae0] text-xs font-bold border border-[#00fae0]/20">
                        {index + 1}
                      </span>
                    </td>
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}