import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ComparisonView } from "@/components/techtrend/ComparisonView";
import { ChartSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/StateComponents";

import { fetchStacks, fetchComparison, Stack, ComparisonData } from "@/lib/api";

const ACCENT_COLOR = "#00fae0";

export default function StackComparison() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>("");

  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStacks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchStacks();
      setStacks(data);
    } catch {
      setError("Failed to load stacks");
    } finally {
      setIsLoading(false);
    }
  };

  const runComparison = async (stackList: string[]) => {
    if (stackList.length < 2) return;

    setIsComparing(true);

    try {
      const data = await fetchComparison(stackList);
      setComparisonData(data);
    } catch {
      console.error("Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  const addStack = () => {
    if (!currentSelection) return;

    const updated = [...selectedStacks, currentSelection];

    setSelectedStacks(updated);
    setCurrentSelection("");

    if (updated.length >= 2) runComparison(updated);
  };

  const removeStack = (stack: string) => {
    const updated = selectedStacks.filter((s) => s !== stack);

    setSelectedStacks(updated);
    setComparisonData(null);

    if (updated.length >= 2) runComparison(updated);
  };

  useEffect(() => {
    loadStacks();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadStacks} />;
  }

  const availableStacks = stacks.filter(
    (s) => !selectedStacks.includes(s.name)
  );

  const insights =
    comparisonData?.stacks?.length > 0
      ? (() => {
          const sorted = [...comparisonData.stacks].sort(
            (a, b) => b.avg_daily_activity - a.avg_daily_activity
          );

          const highest = sorted[0];
          const lowest = sorted[sorted.length - 1];

          const stable = [...comparisonData.stacks].sort(
            (a, b) => a.max_daily - a.min_daily - (b.max_daily - b.min_daily)
          )[0];

          return { highest, lowest, stable };
        })()
      : null;

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white">Stack Comparison</h1>

        <p className="text-zinc-400 mt-1">
          Compare technologies to see which performs better in real usage.
        </p>
      </motion.div>

      {/* CONTROL PANEL */}

      <div className="bg-black border border-white/10 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {isLoading ? (
            <div className="h-10 flex-1 bg-white/5 rounded-md animate-pulse" />
          ) : (
            <div className="flex-1">
              <Select value={currentSelection} onValueChange={setCurrentSelection}>
                <SelectTrigger className="bg-black border-white/10 text-white">
                  <SelectValue placeholder="Select technology stack" />
                </SelectTrigger>

                <SelectContent className="bg-black border border-white/10 text-white">
                  {availableStacks.map((stack) => (
                    <SelectItem key={stack.name} value={stack.name}>
                      {stack.name}
                      <span className="text-zinc-500 ml-2 text-xs">
                        ({stack.category})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={addStack}
            disabled={!currentSelection}
            className="gap-2"
            style={{ background: ACCENT_COLOR, color: "black" }}
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* SELECTED STACKS */}

        <AnimatePresence>
          {selectedStacks.length > 0 && (
            <motion.div className="flex flex-wrap gap-2">
              {selectedStacks.map((stack) => (
                <span
                  key={stack}
                  className="flex items-center gap-2 px-3 py-1 rounded-full border text-sm"
                  style={{
                    borderColor: "rgba(0,250,224,0.2)",
                    background: "rgba(0,250,224,0.08)",
                    color: ACCENT_COLOR,
                  }}
                >
                  {stack}

                  <button onClick={() => removeStack(stack)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-zinc-500">
          Add at least two stacks. Comparison will run automatically.
        </p>
      </div>

      {/* INSIGHT CARDS */}

      {insights && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-black border border-white/10 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Highest Activity</p>
            <h3 className="text-lg font-semibold text-white">
              {insights.highest.name}
            </h3>
            <p className="text-zinc-500 text-sm">
              {insights.highest.avg_daily_activity.toLocaleString()} daily avg
            </p>
          </div>

          <div className="bg-black border border-white/10 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Most Stable</p>
            <h3 className="text-lg font-semibold text-white">
              {insights.stable.name}
            </h3>
            <p className="text-zinc-500 text-sm">
              Lowest volatility among compared stacks
            </p>
          </div>

          <div className="bg-black border border-white/10 rounded-xl p-5">
            <p className="text-zinc-400 text-sm">Lowest Activity</p>
            <h3 className="text-lg font-semibold text-white">
              {insights.lowest.name}
            </h3>
            <p className="text-zinc-500 text-sm">
              {insights.lowest.avg_daily_activity.toLocaleString()} daily avg
            </p>
          </div>
        </div>
      )}

      {/* RESULTS */}

      {isComparing ? (
        <ChartSkeleton />
      ) : comparisonData ? (
        <ComparisonView data={comparisonData} />
      ) : (
        <div className="bg-black border border-white/10 rounded-xl p-10 text-center">
          <GitCompare className="mx-auto mb-4 text-zinc-600" size={40} />

          <h3 className="text-lg font-medium text-white">
            Choose stacks to compare
          </h3>

          <p className="text-zinc-500 mt-1">
            Add technologies above and the system will analyze their activity
            trends automatically.
          </p>
        </div>
      )}
    </div>
  );
}