import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ForecastChart } from '@/components/techtrend/ForecastChart';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/StateComponents';
import { fetchStacks, fetchForecast, Stack, ForecastData } from '@/lib/api';
import { LineChart, Calendar, Info } from 'lucide-react';

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export default function StackForecast() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [selectedStack, setSelectedStack] = useState<string>('');
  const [forecastDays, setForecastDays] = useState(30);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStacks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStacks();
      setStacks(data);
      if (data.length > 0) {
        setSelectedStack(data[0].name);
      }
    } catch {
      setError('Failed to load stacks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadForecast = async () => {
    if (!selectedStack) return;
    setIsForecastLoading(true);
    try {
      const data = await fetchForecast(selectedStack, forecastDays);
      setForecastData(data);
    } catch {
      console.error('Failed to load forecast');
    } finally {
      setIsForecastLoading(false);
    }
  };

  useEffect(() => {
    loadStacks();
  }, []);

  useEffect(() => {
    if (selectedStack) {
      loadForecast();
    }
  }, [selectedStack, forecastDays]);

  if (error) {
    return <ErrorState message={error} onRetry={loadStacks} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Stack Forecast</h1>
        <p className="text-zinc-400 mt-1">
          Visualize future adoption trends using predictive analytics
        </p>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-black border border-white/10 rounded-xl p-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Stack Selection */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <LineChart className="h-4 w-4" style={{ color: ACCENT_COLOR }} />
              Select Stack
            </label>
            {isLoading ? (
              <div className="h-10 bg-white/5 rounded-md animate-pulse" />
            ) : (
              <Select value={selectedStack} onValueChange={setSelectedStack}>
                <SelectTrigger className="w-full bg-black border-white/10 text-white focus:ring-[#00fae0]">
                  <SelectValue placeholder="Choose a technology" />
                </SelectTrigger>
                <SelectContent className="bg-black border border-white/10 text-white">
                  {stacks.map((stack) => (
                    <SelectItem 
                      key={stack.name} 
                      value={stack.name}
                      className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]"
                    >
                      {stack.name} <span className="text-zinc-500 ml-1">({stack.category})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Forecast Days Slider */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-300">
              <Calendar className="h-4 w-4" style={{ color: ACCENT_COLOR }} />
              Forecast Days: <span className="text-white font-bold">{forecastDays}</span>
            </label>
            <div className="pt-2">
              {/* Note: Standard UI Slider usually takes a className for the track/thumb. 
                  If using standard shadcn/ui, the primary color config controls the fill.
                  We apply accent color styles to the container context. */}
              <Slider
                value={[forecastDays]}
                onValueChange={(value) => setForecastDays(value[0])}
                min={7}
                max={90}
                step={1}
                className="w-full"
                // Assuming the Slider component accepts styling or relies on --primary css variable.
                // If inline styles are needed for the track:
                style={{ '--primary': ACCENT_COLOR } as React.CSSProperties} 
              />
              <div className="flex justify-between text-xs text-zinc-500 mt-2 font-mono">
                <span>7 days</span>
                <span>90 days</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Chart Area */}
      {isForecastLoading ? (
        <ChartSkeleton />
      ) : forecastData ? (
        <ForecastChart data={forecastData} />
      ) : null}

      {/* Info Card / Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-black border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-[#00fae0]/10 shrink-0">
            <Info className="h-5 w-5" style={{ color: ACCENT_COLOR }} />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-white">Understanding the Forecast</h3>
              
              <ul className="space-y-3 text-sm text-zinc-400 mt-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ACCENT_COLOR }} />
                  <span>
                    <strong className="text-zinc-200">Predicted Activity:</strong> The central line shows the expected daily activity based on historical patterns, trend analysis, and seasonality.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-zinc-600 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-zinc-200">Confidence Bounds:</strong> The shaded area represents the 95% confidence interval. Wider shaded areas indicate higher uncertainty in the prediction.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-zinc-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="text-zinc-200">Model:</strong> Forecasts are generated using Prophet, an additive regression model that fits non-linear trends with yearly, weekly, and daily seasonality.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}