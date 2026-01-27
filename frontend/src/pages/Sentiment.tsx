import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockSentimentAnalysis } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SentimentGauge } from '@/components/dashboard/SentimentGauge';
import { cn } from '@/lib/utils';

// Core brand accent
const ACCENT = '#00faee';

const Sentiment = () => {
  const [owner, setOwner] = useState('facebook');
  const [repo, setRepo] = useState('react');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result] = useState(mockSentimentAnalysis);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  return (
    <DashboardLayout
      title="Neural Sentiment"
      description="Processing repository telemetry from issues, PRs, and community discourse"
    >
      {/* Page container */}
      <div className="mx-auto w-full max-w-6xl space-y-10 min-h-screen px-4 pb-10">

        {/* ================= INPUT FORM ================= */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border bg-card p-8 overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-[60px] pointer-events-none" />

          <h3 className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em]">
            <MessageSquare className="h-4 w-4 text-primary" />
            Configure Analysis Target
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-6 items-end">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Namespace Owner
              </label>
              <Input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., facebook"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Repository ID
              </label>
              <Input
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="e.g., react"
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !owner || !repo}
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-xs transition-all hover:brightness-110"
              style={{
                backgroundColor: ACCENT,
                color: '#000',
                boxShadow: `0 0 20px ${ACCENT}30`,
              }}
            >
              {isAnalyzing ? 'Analyzing…' : 'Initiate Scan'}
            </Button>
          </div>
        </motion.div>

        {/* ================= RESULTS ================= */}
        {result && (
          <>
            {/* ===== Gauge ===== */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto w-full max-w-3xl rounded-2xl border bg-card p-10 flex flex-col items-center shadow-2xl"
            >
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">
                {result.owner}/{result.repo}
              </h3>
              <p className="mb-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Global Polarity Index
              </p>

              <SentimentGauge
                score={result.sentiment_score}
                sentiment={result.overall_sentiment}
                size="lg"
              />

              <div className="mt-10 flex items-center gap-3 rounded-full border bg-muted px-5 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Confidence:
                </span>
                <span className="font-mono text-xs font-bold text-primary">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </motion.div>

            {/* ===== Breakdown ===== */}
            <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-3">
              {[
                { label: 'Positive', value: result.breakdown.positive, color: ACCENT },
                { label: 'Neutral', value: result.breakdown.neutral, color: '#71717a' },
                { label: 'Negative', value: result.breakdown.negative, color: '#f43f5e' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'rounded-2xl border bg-card p-8 text-center transition-all hover:scale-[1.02]'
                  )}
                >
                  <div
                    className="mb-3 text-5xl font-black font-mono tracking-tighter"
                    style={{ color: stat.color }}
                  >
                    {stat.value}%
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {stat.label} Sentiment
                  </p>
                </motion.div>
              ))}
            </div>

            {/* ===== Neural Synthesis ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto w-full max-w-4xl rounded-2xl border bg-card p-8 relative"
            >
              <div className="absolute top-0 left-0 h-full w-1 bg-primary" />

              <h3 className="ml-4 mb-4 text-xs font-black uppercase tracking-[0.2em]">
                Neural Synthesis
              </h3>

              <p className="ml-4 text-muted-foreground italic text-lg">
                “{result.explanation}”
              </p>

              <div className="ml-4 mt-6 flex flex-wrap gap-2">
                {result.key_topics.map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>

              <p className="ml-4 mt-6 text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                Telemetric Sync Timestamp: {new Date(result.analyzed_at).toLocaleString()}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sentiment;
