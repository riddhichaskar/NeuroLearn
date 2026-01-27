import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ForecastData } from '@/lib/api';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ForecastChartProps {
  data: ForecastData;
  isLoading?: boolean;
}

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export function ForecastChart({ data, isLoading }: ForecastChartProps) {
  if (isLoading) {
    return (
      <div className="bg-black border border-white/10 rounded-xl p-6 h-96 animate-pulse">
        <div className="h-full bg-white/5 rounded-lg" />
      </div>
    );
  }

  const trendIcon = {
    up: <TrendingUp className="h-5 w-5" style={{ color: ACCENT_COLOR }} />,
    down: <TrendingDown className="h-5 w-5 text-red-500" />,
    stable: <Minus className="h-5 w-5 text-zinc-500" />,
  };

  const chartData = data.forecast.map((point) => ({
    date: point.date,
    predicted: point.predicted,
    upperBound: point.upper_bound,
    lowerBound: point.lower_bound,
    range: [point.lower_bound, point.upper_bound],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-black border border-white/10 rounded-xl p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">{data.stack_name} Forecast</h3>
          <p className="text-sm text-zinc-400">
            {data.forecast.length}-day prediction using {data.model_used}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-white">
            {trendIcon[data.trend_direction]}
            <span className="capitalize">{data.trend_direction} Trend</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Info className="h-4 w-4" />
            <span>{data.confidence_interval}% Confidence</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              {/* Main Prediction Gradient (Accent Color) */}
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0} />
              </linearGradient>
              
              {/* Confidence Interval Gradient (White/Gray) */}
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ffffff" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              tick={{ fontSize: 12, fill: '#a1a1aa' }} // zinc-400
              stroke="#52525b" // zinc-600
            />
            
            <YAxis
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 12, fill: '#a1a1aa' }}
              stroke="#52525b"
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => {
                // Formatting names for cleaner tooltip
                const label = name === 'predicted' ? 'Predicted' : name === 'upperBound' ? 'Upper Bound' : 'Lower Bound';
                return [value.toLocaleString(), label];
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              labelStyle={{ color: ACCENT_COLOR, fontWeight: 'bold' }}
            />
            
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {/* Upper Bound Area (Subtle) */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stroke="#52525b" // zinc-600
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="url(#colorConfidence)"
              name="Upper Bound"
            />
            
            {/* Lower Bound Area (Hidden fill, just creates the bottom of the range) */}
            <Area
              type="monotone"
              dataKey="lowerBound"
              stroke="#52525b"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="transparent" // Transparent so we only see the range between upper/lower via the upper fill
              name="Lower Bound"
            />
            
            {/* Main Prediction Line (Neon Accent) */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke={ACCENT_COLOR}
              strokeWidth={3}
              fill="url(#colorPredicted)"
              name="Predicted"
              activeDot={{ r: 6, fill: ACCENT_COLOR, stroke: '#000', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{data.recent_average.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Recent Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{data.historical_total.toLocaleString()}</p>
          <p className="text-xs text-zinc-500">Historical Total</p>
        </div>
        <div className="text-center">
          <p className={cn(
            "text-2xl font-bold capitalize",
            data.trend_direction === 'up' ? `text-[${ACCENT_COLOR}]` : 
            data.trend_direction === 'down' ? "text-red-500" : "text-zinc-400"
          )}
          style={data.trend_direction === 'up' ? { color: ACCENT_COLOR } : {}}
          >
            {data.trend_direction}
          </p>
          <p className="text-xs text-zinc-500">Trend Direction</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white">{data.model_used}</p>
          <p className="text-xs text-zinc-500">Model Used</p>
        </div>
      </div>
    </motion.div>
  );
}