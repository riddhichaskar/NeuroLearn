import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Plus, X, Star, GitFork, Activity, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockRepositories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Core brand color - Pure Electric Cyan
const ACCENT = "#00faee";

const Competitors = () => {
  const [mainRepo, setMainRepo] = useState('facebook/react');
  const [competitorInputs, setCompetitorInputs] = useState(['vuejs/vue', 'angular/angular']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock comparison data - ensuring it maps to the correct Repository type structure
  const comparisonData = [
    {
      repo: mockRepositories[0],
      strengths: ['Largest community', 'Best documentation', 'Industry standard'],
      weaknesses: ['Steeper learning curve', 'Frequent API changes'],
    },
    {
      repo: mockRepositories[2],
      strengths: ['Easy to learn', 'Great performance', 'Excellent tooling'],
      weaknesses: ['Smaller ecosystem', 'Less job market demand'],
    },
    {
      repo: { ...mockRepositories[0], name: 'angular', full_name: 'angular/angular', stars: 89432, forks: 23456, overall_score: 82 },
      strengths: ['Enterprise ready', 'Full framework', 'TypeScript first'],
      weaknesses: ['Complex setup', 'Larger bundle size', 'Slower adoption'],
    },
  ];

  const addCompetitor = () => {
    setCompetitorInputs([...competitorInputs, '']);
  };

  const removeCompetitor = (index: number) => {
    setCompetitorInputs(competitorInputs.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  return (
    <DashboardLayout 
      title="Strategic Analysis" 
      description="Competitive benchmarking and ecosystem positioning"
    >
      <div className="space-y-8 bg-black min-h-screen">
        {/* Input Form - Tactical Pure Dark Container */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 shadow-xl relative overflow-hidden"
        >
          {/* Background Glow Effect */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#00faee]/5 blur-[60px] pointer-events-none" />
          
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-2 relative z-10">
            <Swords className="h-4 w-4" style={{ color: ACCENT }} />
            Configure Comparison Matrix
          </h3>
          
          <div className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Main Repository Namespace</label>
                <Input
                  placeholder="owner/repo"
                  value={mainRepo}
                  onChange={(e) => setMainRepo(e.target.value)}
                  className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-200 focus-visible:ring-[#00faee50] h-12 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest ml-1">Target Competitors</label>
                <div className="space-y-3">
                  {competitorInputs.map((input, index) => (
                    <div key={index} className="flex gap-2 group">
                      <Input
                        placeholder="owner/repo"
                        value={input}
                        onChange={(e) => {
                          const newInputs = [...competitorInputs];
                          newInputs[index] = e.target.value;
                          setCompetitorInputs(newInputs);
                        }}
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-200 focus-visible:ring-[#00faee50] h-11 rounded-xl"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetitor(index)}
                        className="hover:bg-rose-500/10 hover:text-rose-500 text-zinc-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addCompetitor} 
                    className="gap-2 border-[#1a1a1a] bg-transparent text-zinc-500 hover:text-[#00faee] hover:border-[#00faee30] rounded-lg transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Competitor Node
                  </Button>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full md:w-auto px-10 py-6 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: ACCENT, color: '#000', boxShadow: `0 0 20px ${ACCENT}20` }}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-black border-t-transparent rounded-full"
                  />
                  Processing Logic...
                </div>
              ) : (
                "Generate Strategic Matrix"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Comparison Matrix - Pure Dark Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#1a1a1a] bg-[#020202] overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#111] bg-[#050505]">
                  <th className="text-[10px] font-black uppercase tracking-widest text-zinc-600 text-left p-6">Neural Metrics</th>
                  {comparisonData.map((item, index) => (
                    <th key={index} className="p-6 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white uppercase tracking-tighter">{item.repo.full_name}</span>
                        {index === 0 && (
                          <Badge className="bg-[#00faee10] text-[#00faee] border-[#00faee30] text-[9px] font-black tracking-[0.2em] px-2 py-0.5">PRIMARY</Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Stars', icon: Star, key: 'stars', iconColor: 'text-amber-500' },
                  { label: 'Forks', icon: GitFork, key: 'forks', iconColor: 'text-zinc-500' },
                  { label: 'Intelligence Score', icon: Activity, key: 'overall_score', iconColor: ACCENT }
                ].map((metric) => (
                  <tr key={metric.label} className="border-b border-[#111] hover:bg-white/[0.01] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                        <metric.icon className={cn("h-4 w-4", metric.iconColor !== ACCENT && metric.iconColor)} style={metric.iconColor === ACCENT ? { color: ACCENT } : {}} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{metric.label}</span>
                      </div>
                    </td>
                    {comparisonData.map((item, index) => {
                      const val = item.repo[metric.key as keyof typeof item.repo] as number;
                      const maxVal = Math.max(...comparisonData.map(c => c.repo[metric.key as keyof typeof c.repo] as number));
                      const isHighest = val === maxVal && val > 0;
                      
                      return (
                        <td key={index} className="p-6">
                          <span className={cn(
                            "font-mono text-sm font-bold transition-all",
                            isHighest ? "text-[#00faee]" : "text-zinc-400"
                          )} style={isHighest ? { textShadow: `0 0 12px ${ACCENT}40` } : {}}>
                            {val.toLocaleString()}
                            {isHighest && metric.label === 'Intelligence Score' && <TrendingUp className="inline h-3 w-3 ml-2" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                {/* Strength Analysis */}
                <tr className="border-b border-[#111]">
                  <td className="p-6 align-top">
                    <div className="flex items-center gap-3 text-[#00faee] opacity-80">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Market Strengths</span>
                    </div>
                  </td>
                  {comparisonData.map((item, index) => (
                    <td key={index} className="p-6">
                      <ul className="space-y-3">
                        {item.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start gap-3 leading-relaxed group">
                            <span className="text-[#00faee] font-black group-hover:animate-pulse">›</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Risk Analysis */}
                <tr>
                  <td className="p-6 align-top">
                    <div className="flex items-center gap-3 text-rose-500/80">
                      <TrendingDown className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Critical Risks</span>
                    </div>
                  </td>
                  {comparisonData.map((item, index) => (
                    <td key={index} className="p-6">
                      <ul className="space-y-3">
                        {item.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs text-zinc-500 flex items-start gap-3 leading-relaxed">
                            <span className="text-rose-500/50 font-black">×</span>
                            {w}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Neural Summary Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#00faee20] bg-[#020202] p-8 shadow-[0_0_50px_rgba(0,250,238,0.03)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ACCENT }} />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-4 ml-2">Neural Strategic Synthesis</h3>
          <p className="text-zinc-400 leading-relaxed text-sm ml-2">
            Telemetry data indicates that <strong style={{ color: ACCENT }}>{mainRepo}</strong> maintains ecosystem dominance through mass community adoption. While <span className="text-zinc-200">performance-optimized nodes</span> are emerging, the primary competitive moat remains the density of the <span className="text-[#00faee]/70">existing knowledge base</span>. 
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Competitors;