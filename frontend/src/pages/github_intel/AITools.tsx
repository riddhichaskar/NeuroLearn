import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Tag, Lightbulb } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Your core brand color
const ACCENT = "#00faee";

const AITools = () => {
  const [classifyInput, setClassifyInput] = useState('');
  const [explainInput, setExplainInput] = useState('');
  const [explainContext, setExplainContext] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock results
  const classifyResults = [
    { input: 'A fast and secure web framework for Rust', category: 'Web Frameworks', confidence: 0.94, subcategories: ['Backend', 'Rust', 'Performance'] },
    { input: 'Machine learning library for Python with GPU support', category: 'Machine Learning', confidence: 0.97, subcategories: ['AI', 'Python', 'Deep Learning'] },
    { input: 'Command-line tool for managing Docker containers', category: 'DevOps Tools', confidence: 0.89, subcategories: ['CLI', 'Containers', 'Infrastructure'] },
  ];

  const explainResult = {
    explanation: 'This repository implements a high-performance web framework leveraging Rust\'s ownership model to provide memory safety without garbage collection. The async runtime enables handling thousands of concurrent connections efficiently. Key features include middleware support, route matching, and built-in security features like CSRF protection.',
    context: ['Zero-cost abstractions', 'Async/await support', 'Type-safe routing'],
    confidence: 0.91,
  };

  const handleClassify = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1500);
  };

  const handleExplain = () => {
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 1500);
  };

  return (
    <DashboardLayout 
      title="AI Intel Tools" 
      description="Neural classification and repository synthesis"
    >
      <div className="space-y-8 bg-black min-h-screen">
        <Tabs defaultValue="classify" className="w-full">
          <TabsList className="w-full max-w-md bg-[#0a0a0a] border border-[#1a1a1a] p-1 rounded-xl">
            <TabsTrigger 
              value="classify" 
              className="flex-1 gap-2 uppercase text-[10px] font-black tracking-widest data-[state=active]:bg-[#111] data-[state=active]:text-[#00faee]"
            >
              <Tag className="h-3 w-3" />
              Classify
            </TabsTrigger>
            <TabsTrigger 
              value="explain" 
              className="flex-1 gap-2 uppercase text-[10px] font-black tracking-widest data-[state=active]:bg-[#111] data-[state=active]:text-[#00faee]"
            >
              <Lightbulb className="h-3 w-3" />
              Explain
            </TabsTrigger>
          </TabsList>

          {/* Classify Tab */}
          <TabsContent value="classify" className="space-y-8 mt-8 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#00faee]/5 blur-[60px] pointer-events-none" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-2">Neural Classifier</h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-xl">
                Input raw repository descriptions. The system will categorize them using the active intelligence model.
              </p>
              
              <Textarea
                placeholder="Enter repository descriptions (e.g. 'A high performance key-value store')..."
                value={classifyInput}
                onChange={(e) => setClassifyInput(e.target.value)}
                rows={5}
                className="mb-6 bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 focus-visible:ring-[#00faee50] rounded-xl placeholder:text-zinc-700"
              />
              
              <Button 
                onClick={handleClassify} 
                disabled={isProcessing || !classifyInput}
                className="w-full md:w-auto px-8 py-6 rounded-xl font-black uppercase tracking-widest text-xs transition-all"
                style={{ 
                  backgroundColor: isProcessing ? '#111' : ACCENT, 
                  color: isProcessing ? ACCENT : '#000',
                  boxShadow: isProcessing ? 'none' : `0 0 25px ${ACCENT}30`
                }}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-[#00faee] border-t-transparent rounded-full"
                    />
                    Analyzing
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Run Classification
                  </div>
                )}
              </Button>
            </motion.div>

            {/* Classification Results */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 ml-1">Output Streams</h3>
              {classifyResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border border-[#1a1a1a] bg-[#020202] p-6 group hover:border-[#00faee30] transition-colors"
                >
                  <p className="text-sm text-zinc-400 mb-4 font-medium">"{result.input}"</p>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-[#00faee10] text-[#00faee] border-[#00faee20] py-1 px-3 uppercase text-[10px] font-bold">
                        {result.category}
                      </Badge>
                      {result.subcategories.map((sub) => (
                        <Badge key={sub} className="bg-[#111] text-zinc-500 border-[#1a1a1a] text-[10px] font-bold uppercase">
                          {sub}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-[#111]">
                      <span className="text-[10px] font-black uppercase text-zinc-600 tracking-tighter">Confidence</span>
                      <span className="font-mono text-sm font-bold" style={{ color: ACCENT }}>
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Explain Tab */}
          <TabsContent value="explain" className="space-y-8 mt-8 outline-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8"
            >
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00faee]" />
                Logic Synthesis
              </h3>
              
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Target Concept</label>
                  <Textarea
                    placeholder="Describe the code, concept, or library you need synthesized..."
                    value={explainInput}
                    onChange={(e) => setExplainInput(e.target.value)}
                    rows={3}
                    className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 focus-visible:ring-[#00faee50] rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Contextual Namespace</label>
                  <Input
                    placeholder="e.g. facebook/react"
                    value={explainContext}
                    onChange={(e) => setExplainContext(e.target.value)}
                    className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 focus-visible:ring-[#00faee50] h-12 rounded-xl"
                  />
                </div>
                <Button 
                  onClick={handleExplain} 
                  disabled={isProcessing || !explainInput}
                  className="w-full py-7 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:brightness-110"
                  style={{ backgroundColor: ACCENT, color: '#000' }}
                >
                  {isProcessing ? "Synthesizing..." : "Generate Explanation"}
                </Button>
              </div>
            </motion.div>

            {/* Explanation Result */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-[#00faee20] bg-[#020202] p-8 shadow-[0_0_50px_rgba(0,250,238,0.03)]"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#111]">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Synthesized Result</h3>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#00faee] animate-pulse" />
                    <span className="font-mono text-xs font-bold text-[#00faee]">
                        {Math.round(explainResult.confidence * 100)}% RELIABILITY
                    </span>
                </div>
              </div>
              
              <p className="text-zinc-400 leading-relaxed mb-8 text-lg font-medium italic">
                {explainResult.explanation}
              </p>
              
              <div className="pt-6 border-t border-[#111] space-y-4">
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Key Logical Context</p>
                <div className="flex flex-wrap gap-2">
                  {explainResult.context.map((ctx) => (
                    <Badge key={ctx} className="bg-transparent border-[#00faee40] text-[#00faee] py-1 px-3 text-[10px] font-bold">
                        {ctx}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AITools;