import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComparisonView } from '@/components/ComparisonView';
import { ChartSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateComponents';
import { fetchStacks, fetchComparison, Stack, ComparisonData } from '@/lib/api';

// Your Accent Color
const ACCENT_COLOR = '#00fae0';

export default function StackComparison() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
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
      setError('Failed to load stacks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    if (selectedStacks.length < 2) return;
    setIsComparing(true);
    try {
      const data = await fetchComparison(selectedStacks);
      setComparisonData(data);
    } catch {
      console.error('Failed to compare stacks');
    } finally {
      setIsComparing(false);
    }
  };

  const addStack = () => {
    if (currentSelection && !selectedStacks.includes(currentSelection)) {
      setSelectedStacks([...selectedStacks, currentSelection]);
      setCurrentSelection('');
    }
  };

  const removeStack = (stack: string) => {
    setSelectedStacks(selectedStacks.filter((s) => s !== stack));
    setComparisonData(null);
  };

  useEffect(() => {
    loadStacks();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={loadStacks} />;
  }

  const availableStacks = stacks.filter((s) => !selectedStacks.includes(s.name));

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-white">Stack Comparison</h1>
        <p className="text-zinc-400 mt-1">
          Compare multiple technologies side-by-side
        </p>
      </motion.div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-black border border-white/10 rounded-xl p-6 shadow-sm"
      >
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {isLoading ? (
              <div className="h-10 flex-1 bg-white/5 rounded-md animate-pulse" />
            ) : (
              // Custom styled Select wrapper
              <div className="flex-1 relative group">
                <Select value={currentSelection} onValueChange={setCurrentSelection}>
                  <SelectTrigger 
                    className="w-full bg-black border-white/10 text-white placeholder:text-zinc-500 focus:ring-[#00fae0] focus:ring-offset-0"
                  >
                    <SelectValue placeholder="Select a stack to add" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border border-white/10 text-white">
                    {availableStacks.map((stack) => (
                      <SelectItem 
                        key={stack.name} 
                        value={stack.name}
                        className="focus:bg-[#00fae0]/10 focus:text-[#00fae0]"
                      >
                        {stack.name} <span className="text-zinc-500 ml-2 text-xs">({stack.category})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Add Button: White Outline style */}
            <Button
              onClick={addStack}
              disabled={!currentSelection}
              className="gap-2 bg-black border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              Add Stack
            </Button>
          </div>

          {/* Selected Stacks Tags */}
          <AnimatePresence>
            {selectedStacks.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {selectedStacks.map((stack) => (
                  <motion.span
                    key={stack}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    // Tag Style: Translucent Accent Background
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                    style={{ 
                      backgroundColor: 'rgba(0, 250, 224, 0.08)', 
                      borderColor: 'rgba(0, 250, 224, 0.2)',
                      color: ACCENT_COLOR 
                    }}
                  >
                    {stack}
                    <button
                      onClick={() => removeStack(stack)}
                      className="rounded-full p-0.5 transition-colors hover:bg-[#00fae0] hover:text-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compare Action Button */}
          <Button
            onClick={handleCompare}
            disabled={selectedStacks.length < 2 || isComparing}
            className="w-full sm:w-auto gap-2 font-semibold shadow-[0_0_20px_-5px_rgba(0,250,224,0.3)] hover:shadow-[0_0_25px_-5px_rgba(0,250,224,0.5)] transition-all"
            style={{ 
              backgroundColor: ACCENT_COLOR, 
              color: '#000000', // Black text for high contrast on neon
              opacity: selectedStacks.length < 2 ? 0.5 : 1
            }}
          >
            <GitCompare className="h-4 w-4" />
            Compare {selectedStacks.length > 0 ? selectedStacks.length : ''} Stacks
          </Button>
        </div>
      </motion.div>

      {/* Results Section */}
      {isComparing ? (
        <ChartSkeleton />
      ) : comparisonData ? (
        <ComparisonView data={comparisonData} />
      ) : selectedStacks.length < 2 ? (
        <div className="bg-black border border-white/10 rounded-xl p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-white/5">
              <GitCompare className="h-8 w-8 text-zinc-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Select stacks to compare</h3>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Add at least 2 technology stacks to generate a detailed performance comparison
          </p>
        </div>
      ) : null}
    </div>
  );
}