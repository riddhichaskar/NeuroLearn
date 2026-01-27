import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { ComparisonData } from '@/lib/api';
import { TrendBadge } from './TrendBadge';

interface ComparisonViewProps {
  data: ComparisonData;
  isLoading?: boolean;
}

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export function ComparisonView({ data, isLoading }: ComparisonViewProps) {
  if (isLoading) {
    return (
      <div className="bg-black border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="h-80 bg-white/5 rounded-lg" />
      </div>
    );
  }

  const chartData = data.stacks.map((stack) => ({
    name: stack.name,
    avgDaily: stack.avg_daily_activity,
    maxDaily: stack.max_daily,
    minDaily: stack.min_daily,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Chart Section */}
      <div className="bg-black border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6 text-white">Activity Comparison</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              {/* Dark Grid */}
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={true} />
              
              <XAxis 
                type="number" 
                tickFormatter={(value) => value.toLocaleString()} 
                stroke="#52525b" // zinc-600
                tick={{ fill: '#a1a1aa', fontSize: 12 }} // zinc-400
              />
              
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                stroke="#52525b"
                tick={{ fill: '#fff', fontSize: 12, fontWeight: 500 }}
              />
              
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: '#000',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(value: number) => [value.toLocaleString(), '']}
                labelStyle={{ color: ACCENT_COLOR, fontWeight: 'bold' }}
              />
              
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              {/* Avg Daily - Uses Accent Color */}
              <Bar 
                dataKey="avgDaily" 
                name="Avg Daily" 
                fill={ACCENT_COLOR} 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
              
              {/* Max Daily - White for contrast */}
              <Bar 
                dataKey="maxDaily" 
                name="Max Daily" 
                fill="#ffffff" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
              />
              
              {/* Min Daily - Dark Gray */}
              <Bar 
                dataKey="minDaily" 
                name="Min Daily" 
                fill="#3f3f46" 
                radius={[0, 4, 4, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Detailed Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Stack</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trend</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Activity</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Avg Daily</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Max Daily</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Min Daily</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.stacks.map((stack, index) => (
                <motion.tr
                  key={stack.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-white group-hover:text-[#00fae0] transition-colors">
                    {stack.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{stack.category}</td>
                  <td className="px-6 py-4">
                    <TrendBadge trend={stack.trend} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-300">
                    {stack.total_activity.toLocaleString()}
                  </td>
                  {/* Avg Daily highlighted with Accent Color */}
                  <td 
                    className="px-6 py-4 text-right font-mono font-bold"
                    style={{ color: ACCENT_COLOR }}
                  >
                    {stack.avg_daily_activity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white">
                    {stack.max_daily.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-zinc-600">
                    {stack.min_daily.toLocaleString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}