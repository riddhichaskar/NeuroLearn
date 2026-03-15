import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "recharts";

import {
  Layers,
  Activity,
  TrendingUp,
  BarChart3,
  Zap,
} from "lucide-react";

import { KPICard } from "@/components/techtrend/KPICard";
import { TrendBadge } from "@/components/techtrend/TrendBadge";
import { CardGridSkeleton, ChartSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/StateComponents";
import { techTrendApi } from "@/lib/api-techtrend";

const ACCENT_COLOR = "#00fae0";
const COLORS = [ACCENT_COLOR, "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef"];

export default function DashboardOverview() {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await techTrendApi.getDashboard();
      setData(result);   // FIXED
    } catch (err) {
      setError("Failed to load dashboard data. Ensure backend on 8002 is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (error) return <ErrorState message={error} onRetry={loadData} />;

  const categoryDistribution =
    data?.categories?.map((cat: any) => ({
      name: cat.category,
      value: cat.total_activity,
    })) || [];

  return (
    <div className="space-y-8">

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Technology ecosystem overview and real-time metrics
        </p>
      </motion.div>

      {isLoading ? (
        <CardGridSkeleton count={5} />
      ) : (
        data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

            <KPICard
              title="Total Stacks"
              value={data.total_stacks}
              icon={Layers}
              iconColor="primary"
            />

            <KPICard
              title="Categories"
              value={data.overall_stats.total_categories}
              icon={BarChart3}
              iconColor="chart"
            />

            <KPICard
              title="Total Activity"
              value={data.overall_stats.total_activity}
              subtitle="Live Aggregated"
              icon={Activity}
              iconColor="growing"
            />

            <KPICard
              title="Growing Stacks"
              value={data.overall_stats.growing_stacks}
              icon={TrendingUp}
              iconColor="growing"
            />

            <KPICard
              title="Avg Daily"
              value={Math.round(data.overall_stats.average_daily_activity)}
              icon={Zap}
              iconColor="warning"
            />

          </div>
        )
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          data && (
            <>
              <motion.div
                className="lg:col-span-2 bg-black border border-white/10 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-white">
                  Top Growing Stacks
                </h3>

                <div className="h-80">

                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_growing} layout="vertical">

                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                      <XAxis
                        type="number"
                        stroke="#52525b"
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      />

                      <YAxis
                        dataKey="stack"
                        type="category"
                        width={90}
                        stroke="#52525b"
                        tick={{ fill: "#fff", fontSize: 12 }}
                      />

                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                        }}
                      />

                      <Bar dataKey="average_daily" radius={[0, 4, 4, 0]} barSize={24}>
                        {data.top_growing.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>

                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </motion.div>

              <motion.div className="bg-black border border-white/10 rounded-xl p-6">

                <h3 className="text-lg font-semibold mb-4 text-white">
                  Activity Distribution
                </h3>

                <div className="h-80">

                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>

                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                        }}
                      />

                    </PieChart>
                  </ResponsiveContainer>

                </div>

              </motion.div>
            </>
          )
        )}
      </div>

      {data && (
        <motion.div className="bg-black border border-white/10 rounded-xl overflow-hidden">

          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">
              Growing Technologies Rank
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs text-zinc-400">Rank</th>
                  <th className="px-6 py-4 text-xs text-zinc-400">Stack</th>
                  <th className="px-6 py-4 text-xs text-zinc-400">Category</th>
                  <th className="px-6 py-4 text-xs text-zinc-400">Trend</th>
                  <th className="px-6 py-4 text-xs text-zinc-400 text-right">
                    Daily Avg
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">

                {data.top_growing.map((item: any, index: number) => (

                  <tr key={item.stack} className="hover:bg-white/5">

                    <td className="px-6 py-4">
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#00fae0]/10 text-[#00fae0] text-xs font-bold">
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-white">{item.stack}</td>

                    <td className="px-6 py-4 text-zinc-400">
                      {item.category}
                    </td>

                    <td className="px-6 py-4">
                      <TrendBadge trend={item.trend} size="sm" />
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-zinc-200">
                      {item.average_daily.toFixed(1)}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </motion.div>
      )}

    </div>
  );
}