import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, GitBranch, Star, GitFork, Eye, ExternalLink, Activity, Users, Code, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockRepositories, mockSentimentAnalysis } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SentimentGauge } from '@/components/dashboard/SentimentGauge';
import { cn } from '@/lib/utils';

// Core brand color
const ACCENT = "#00faee";

const RepositoryDetail = () => {
  const [searchQuery, setSearchQuery] = useState('facebook/react');
  const repo = mockRepositories[0]; 
  const sentiment = mockSentimentAnalysis;

  return (
    <DashboardLayout 
      title="Deep Intel: Repository" 
      description="Neural analysis of repository metrics and ecosystem position"
    >
      <div className="space-y-8 bg-black min-h-screen">
        
        {/* Search Bar - Pure Dark Refactor */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4"
        >
          <div className="relative flex-1">
            <GitBranch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              placeholder="Inject repository namespace (owner/repo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-[#0a0a0a] border-[#1a1a1a] text-zinc-200 focus-visible:ring-[#00faee50] rounded-xl placeholder:text-zinc-700"
            />
          </div>
          <Button 
            className="px-8 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:brightness-110"
            style={{ backgroundColor: ACCENT, color: '#000', boxShadow: `0 0 15px ${ACCENT}30` }}
          >
            Analyze
          </Button>
        </motion.div>

        {/* Repository Header - Pure Dark Refactor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-40 w-40 bg-[#00faee]/5 blur-[80px] pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-start gap-6">
              <img
                src={repo.owner.avatar_url}
                alt={repo.owner.login}
                className="h-20 w-20 rounded-2xl border border-[#2a2a2a] grayscale group-hover:grayscale-0 transition-all"
              />
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{repo.name}</h2>
                  <a href={repo.github_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5 text-zinc-600 hover:text-[#00faee] transition-colors" />
                  </a>
                </div>
                <p className="text-zinc-500 mt-2 max-w-2xl leading-relaxed font-medium">{repo.description}</p>
                <div className="flex items-center gap-3 mt-5">
                  <Badge className="bg-transparent border-[#00faee40] text-[#00faee] font-mono text-[10px] py-1 px-3">
                    {repo.language}
                  </Badge>
                  {repo.topics.slice(0, 4).map((topic) => (
                    <Badge key={topic} className="bg-[#0a0a0a] text-zinc-500 border-[#1a1a1a] text-[10px] font-bold uppercase tracking-tighter">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Badge className={cn(
              "text-[10px] font-black tracking-[0.2em] uppercase py-2 px-4 border",
              repo.sentiment === 'positive' ? "bg-[#00faee10] text-[#00faee] border-[#00faee30]" : "bg-zinc-900 text-zinc-500 border-zinc-800"
            )}>
              {repo.sentiment}
            </Badge>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-4 gap-8 mt-10 pt-8 border-t border-[#111]">
            {[
                { label: 'Stars', value: repo.stars, icon: Star, color: 'text-amber-500' },
                { label: 'Forks', value: repo.forks, icon: GitFork, color: 'text-zinc-500' },
                { label: 'Watchers', value: repo.watchers, icon: Eye, color: 'text-zinc-500' },
                { label: 'Open Issues', value: repo.open_issues, icon: Activity, color: 'text-rose-500' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] p-3">
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-black font-mono text-white tracking-tighter">{stat.value.toLocaleString()}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scores & Sentiment Section */}
        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Repository Health Scores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 shadow-xl"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Ecosystem Health Scores</h3>
            <div className="space-y-6">
              {[
                { label: 'Activity Index', value: repo.activity_score, glow: false },
                { label: 'Popularity Index', value: repo.popularity_score, glow: false },
                { label: 'Community Index', value: repo.community_score, glow: false },
                { label: 'Overall Reliability', value: repo.overall_score, glow: true },
              ].map((score) => (
                <div key={score.label}>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-2.5">
                    <span className="text-zinc-600">{score.label}</span>
                    <span className="font-mono text-white" style={score.glow ? { color: ACCENT } : {}}>{score.value}</span>
                  </div>
                  <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score.value}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ 
                        backgroundColor: score.glow ? ACCENT : '#333',
                        boxShadow: score.glow ? `0 0 10px ${ACCENT}40` : 'none'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Neural Sentiment Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 shadow-xl flex flex-col items-center"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white self-start mb-4">Neural Sentiment Analysis</h3>
            <div className="flex-1 flex items-center justify-center py-6">
              <SentimentGauge 
                score={sentiment.sentiment_score} 
                sentiment={sentiment.overall_sentiment}
                size="lg"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 w-full mt-6">
              {[
                { label: 'Positive', value: sentiment.breakdown.positive, color: ACCENT },
                { label: 'Neutral', value: sentiment.breakdown.neutral, color: '#333' },
                { label: 'Negative', value: sentiment.breakdown.negative, color: '#f43f5e' }
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-[#0a0a0a] border border-[#111] text-center">
                  <p className="text-xl font-black font-mono tracking-tighter" style={{ color: item.color }}>{item.value}%</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-600 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Analysis Summary - Final Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#00faee20] bg-[#020202] p-8 shadow-[0_0_50px_rgba(0,250,238,0.03)] relative"
        >
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ACCENT }} />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Automated Intelligence Synthesis</h3>
          <p className="text-zinc-400 leading-relaxed text-lg font-medium italic">"{sentiment.explanation}"</p>
          <div className="mt-8 pt-6 border-t border-[#111]">
            <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-4">Identified Key Vectors</p>
            <div className="flex flex-wrap gap-2">
              {sentiment.key_topics.map((topic) => (
                <Badge key={topic} className="bg-transparent border-[#00faee30] text-[#00faee] text-[10px] font-bold uppercase tracking-tighter py-1 px-3">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default RepositoryDetail;