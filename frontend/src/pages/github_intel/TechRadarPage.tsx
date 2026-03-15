import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TechRadar } from '@/components/dashboard/TechRadar';
import { mockTechRadarData } from '@/data/mockData';
import { TechRadarItem } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// Core brand color
const ACCENT = "#00faee";

const TechRadarPage = () => {
  const [selectedItem, setSelectedItem] = useState<TechRadarItem | null>(null);

  const quadrantColors = {
    adopt: 'text-[#00faee]',
    trial: 'text-[#00faee]/70',
    assess: 'text-zinc-500',
    hold: 'text-rose-500',
  };

  return (
    <DashboardLayout 
      title="Technology Radar" 
      description="Strategic assessment of the global technical landscape"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8 bg-black min-h-screen"
      >
        {/* Introduction Section - Pure Dark Refactor */}
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#00faee]/5 blur-[60px] pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-[#00faee]" />
            <h2 className="font-black text-xs uppercase tracking-[0.3em] text-white">System Protocol: Radar</h2>
          </div>
          
          <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
            The Tech Radar is a dynamic visualization of our adoption lifecycle. Nodes are mapped into four priority sectors based on cluster density and neural growth patterns:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'ADOPT', desc: 'Standardized clusters', color: ACCENT, bg: 'bg-[#00faee]/10', border: 'border-[#00faee]/20' },
              { label: 'TRIAL', desc: 'High potential growth', color: `${ACCENT}cc`, bg: 'bg-[#00faee]/5', border: 'border-[#00faee]/10' },
              { label: 'ASSESS', desc: 'Emerging discovery', color: '#71717a', bg: 'bg-zinc-900/50', border: 'border-zinc-800' },
              { label: 'HOLD', desc: 'Caution recommended', color: '#f43f5e', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
            ].map((item) => (
              <div key={item.label} className={cn("p-4 rounded-xl border transition-all hover:scale-105", item.bg, item.border)}>
                <h3 className="font-black text-[10px] tracking-widest" style={{ color: item.color }}>{item.label}</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-tighter">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart Component */}
        <TechRadar 
          data={mockTechRadarData} 
          onItemClick={(item) => setSelectedItem(item)} 
        />

        {/* Detail Dialog - High-End Dark UI */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="bg-[#050505] border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,1)] max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-4">
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-xl border transition-all"
                  style={{ backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30`, color: ACCENT }}
                >
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-white uppercase tracking-tighter">{selectedItem?.name}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "mt-1 w-fit text-[9px] font-black tracking-widest uppercase border", 
                      selectedItem && quadrantColors[selectedItem.quadrant],
                      selectedItem?.quadrant === 'adopt' ? "border-[#00faee40]" : "border-zinc-800"
                    )}
                  >
                    Priority: {selectedItem?.quadrant}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedItem && (
              <div className="space-y-8 pt-8">
                {/* Tactical Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Cluster Units', value: selectedItem.repo_count.toLocaleString() },
                    { label: 'Avg Peer Rating', value: selectedItem.avg_stars.toLocaleString() },
                    { label: 'Growth Velocity', value: `${selectedItem.growth_rate > 0 ? '+' : ''}${selectedItem.growth_rate}%`, trend: true },
                    { label: 'Neural Confidence', value: `${Math.round(selectedItem.confidence * 100)}%` }
                  ].map((stat) => (
                    <div key={stat.label} className="p-5 rounded-2xl bg-[#0a0a0a] border border-[#111] group hover:border-[#222] transition-all">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        {stat.trend && (
                          selectedItem.growth_rate > 10 ? <TrendingUp className="h-4 w-4 text-[#00faee]" /> :
                          selectedItem.growth_rate < 0 ? <TrendingDown className="h-4 w-4 text-rose-500" /> :
                          <Minus className="h-4 w-4 text-zinc-700" />
                        )}
                        <p className="text-2xl font-black font-mono tracking-tighter text-zinc-200" 
                           style={stat.trend && selectedItem.growth_rate > 0 ? { color: ACCENT } : {}}>
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between px-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Namespace Category</p>
                    <Badge className="bg-[#111] text-zinc-300 border-[#1a1a1a] uppercase text-[10px] font-bold py-1 px-4">
                      {selectedItem.category}
                    </Badge>
                  </div>

                  {selectedItem.moved && selectedItem.moved !== 'none' && (
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Trajectory</p>
                      <Badge className={cn(
                        "uppercase text-[10px] font-black py-1 px-4 border",
                        selectedItem.moved === 'up' 
                          ? "bg-[#00faee10] text-[#00faee] border-[#00faee30]" 
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>
                        Vector {selectedItem.moved}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Pulsing Action Button */}
                <button 
                  className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98]"
                  style={{ backgroundColor: ACCENT, color: '#000', boxShadow: `0 0 30px ${ACCENT}30` }}
                  onClick={() => setSelectedItem(null)}
                >
                  Close Data Stream
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default TechRadarPage;