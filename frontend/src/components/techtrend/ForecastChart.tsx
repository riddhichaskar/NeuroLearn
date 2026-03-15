import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ForecastData } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForecastChartProps {
  data: ForecastData;
  isLoading?: boolean;
}

const ACCENT_COLOR = "#00fae0";

export function ForecastChart({ data, isLoading }: ForecastChartProps) {

  if (isLoading) {
    return (
      <div className="bg-black border border-white/10 rounded-xl p-6 h-96 animate-pulse">
        <div className="h-full bg-white/5 rounded-lg" />
      </div>
    );
  }

  const trendIcon = {
    up: <TrendingUp className="h-5 w-5 text-[#00fae0]" />,
    down: <TrendingDown className="h-5 w-5 text-red-500" />,
    stable: <Minus className="h-5 w-5 text-zinc-500" />,
  };

  const chartData =
    data?.forecast?.map((p) => ({
      date: p.date,
      predicted: p.predicted,
      upper: p.upper_bound,
      lower: p.lower_bound,
    })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-white/10 rounded-xl p-6"
    >

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h3 className="text-xl font-semibold text-white">
            {data.stack_name} Forecast
          </h3>

          <p className="text-sm text-zinc-400">
            {data.forecast.length} day prediction • {data.model_used}
          </p>
        </div>

        <div className="flex flex-wrap gap-4">

          <div className="flex items-center gap-2 text-sm text-white">
            {trendIcon[data.trend_direction]}
            <span className="capitalize">{data.trend_direction} trend</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Info className="h-4 w-4" />
            {data.confidence_interval}% confidence
          </div>

        </div>
      </div>

      {/* CHART */}

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={chartData}>

            <defs>

              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.35} />
                <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0} />
              </linearGradient>

              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>

            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" />

            <XAxis
              dataKey="date"
              stroke="#52525b"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />

            <YAxis
              stroke="#52525b"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
              tickFormatter={(v) => v.toLocaleString()}
            />

            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "#000",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => value.toLocaleString()}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              }
            />

            <Legend />

            {/* CONFIDENCE AREA */}

            <Area
              type="monotone"
              dataKey="upper"
              stroke="#555"
              strokeDasharray="4 4"
              fill="url(#confidenceGradient)"
              name="Upper Bound"
            />

            <Area
              type="monotone"
              dataKey="lower"
              stroke="#555"
              strokeDasharray="4 4"
              fill="transparent"
              name="Lower Bound"
            />

            {/* PREDICTION */}

            <Area
              type="monotone"
              dataKey="predicted"
              stroke={ACCENT_COLOR}
              strokeWidth={3}
              fill="url(#predictedGradient)"
              activeDot={{
                r: 6,
                fill: ACCENT_COLOR,
                stroke: "#000",
                strokeWidth: 2,
              }}
              name="Prediction"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      {/* METRICS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">

        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {data.recent_average.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500">Recent Avg</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-white">
            {data.historical_total.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-500">Historical Total</p>
        </div>

        <div className="text-center">
          <p
            className={cn(
              "text-2xl font-bold capitalize",
              data.trend_direction === "up"
                ? "text-[#00fae0]"
                : data.trend_direction === "down"
                ? "text-red-500"
                : "text-zinc-400"
            )}
          >
            {data.trend_direction}
          </p>
          <p className="text-xs text-zinc-500">Trend</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-white">{data.model_used}</p>
          <p className="text-xs text-zinc-500">Model</p>
        </div>

      </div>

    </motion.div>
  );
}