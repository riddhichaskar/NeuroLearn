import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, RefreshCw, Clock, CheckCircle, XCircle, Loader2, List } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockIngestJobs, mockCategories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Your core brand color
const ACCENT = "#00faee";

const statusConfig = {
  pending: { icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-900', accent: 'border-zinc-800' },
  running: { icon: Loader2, color: 'text-[#00faee]', bg: 'bg-[#00faee]/10', accent: 'border-[#00faee]/30' },
  completed: { icon: CheckCircle, color: 'text-zinc-300', bg: 'bg-zinc-800/50', accent: 'border-zinc-700' },
  failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', accent: 'border-rose-500/20' },
};

const Ingestion = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTriggerTrending = () => {
    setIsTriggering(true);
    setTimeout(() => setIsTriggering(false), 1500);
  };

  const handleTriggerAutomated = () => {
    setIsTriggering(true);
    setTimeout(() => setIsTriggering(false), 1500);
  };

  return (
    <DashboardLayout 
      title="Data Ingestion" 
      description="Telemetry ingestion and neural processing queue"
    >
      <div className="space-y-8 bg-black min-h-screen">
        {/* Control Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { 
                title: 'Trending Pulse', 
                desc: 'Sync real-time trending clusters from the global GitHub index.', 
                btn: 'Trigger Sync', 
                handler: handleTriggerTrending, 
                icon: PlayCircle,
                variant: 'primary'
            },
            { 
                title: 'Automated Neural', 
                desc: 'Initiate scheduled category analysis via automated pipelines.', 
                btn: 'Run Auto-Process', 
                handler: handleTriggerAutomated, 
                icon: RefreshCw,
                variant: 'outline'
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#00faee]/5 blur-[60px] pointer-events-none" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-3">{card.title}</h3>
              <p className="text-sm text-zinc-500 mb-8 leading-relaxed">{card.desc}</p>
              <Button 
                onClick={card.handler} 
                disabled={isTriggering}
                className={cn(
                    "w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                    card.variant === 'primary' ? "hover:brightness-110" : "border-[#1a1a1a] bg-transparent hover:bg-zinc-900"
                )}
                style={card.variant === 'primary' ? { backgroundColor: ACCENT, color: '#000' } : {}}
              >
                {isTriggering ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <card.icon className="h-4 w-4 mr-2" />
                )}
                {card.btn}
              </Button>
            </motion.div>
          ))}

          {/* Category Selector Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8"
          >
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-3">Target Injection</h3>
            <p className="text-sm text-zinc-500 mb-8">Execute targeted data extraction for specific technical namespaces.</p>
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1 bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 rounded-xl">
                  <SelectValue placeholder="Namespace" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-[#1a1a1a] text-zinc-400">
                  <SelectItem value="all">All Ecosystems</SelectItem>
                  {mockCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="h-10 w-10 p-0 rounded-xl"
                style={{ backgroundColor: ACCENT, color: '#000' }}
              >
                <PlayCircle className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Job Queue Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-[#1a1a1a] bg-[#020202] overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#111] bg-[#050505]">
            <div className="flex items-center gap-3">
              <List className="h-4 w-4 text-[#00faee]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Active Queue</h3>
            </div>
            <Badge className="bg-[#111] text-zinc-500 border-[#1a1a1a] font-mono text-xs">
              {mockIngestJobs.length} BLOCKS
            </Badge>
          </div>

          <div className="divide-y divide-[#111]">
            {mockIngestJobs.map((job, index) => {
              const config = statusConfig[job.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-white/[0.01] transition-all group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("rounded-xl p-3 border", config.bg, config.accent)}>
                        <StatusIcon className={cn(
                          "h-5 w-5",
                          config.color,
                          job.status === 'running' && "animate-spin"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200 uppercase tracking-tight">
                          {job.type} Process
                        </p>
                        <p className="text-[10px] font-mono text-zinc-600 mt-1">
                          HEX_ID: {job.id.toUpperCase()} {job.category && `// NS: ${job.category}`}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={cn(
                        "uppercase text-[9px] font-black tracking-widest bg-transparent border",
                        config.color,
                        config.accent
                      )}
                    >
                      {job.status}
                    </Badge>
                  </div>

                  {(job.status === 'running' || job.status === 'completed') && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                        <span className="text-zinc-600">Saturation Level</span>
                        <span className="font-mono" style={{ color: ACCENT }}>{job.progress}%</span>
                      </div>
                      <Progress 
                        value={job.progress} 
                        className="h-1 bg-[#111]" 
                        style={{ '--progress-foreground': ACCENT } as any}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(job.started_at).toLocaleTimeString()}
                    </span>
                    <span className="font-mono text-zinc-400">
                      {job.repos_processed.toLocaleString()} UNITS_PROCESSED
                    </span>
                    {job.errors > 0 && (
                      <span className="text-rose-500 font-black">
                        {job.errors} SYSTEM_FAULT_ERRORS
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Ingestion;