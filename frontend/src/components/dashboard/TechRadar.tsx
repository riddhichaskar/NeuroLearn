import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TechRadarItem, TechRadarData } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

// Your core brand color
const ACCENT = "#00faee";

interface TechRadarProps {
  data: TechRadarData;
  onItemClick?: (item: TechRadarItem) => void;
}

/**
 * Pure Dark Quadrant Mapping
 * Instead of rainbow colors, we use monochromatic cyan with varying glow intensities.
 */
const quadrantColors = {
  adopt: { bg: `fill-[${ACCENT}]`, border: `stroke-[${ACCENT}]`, text: `text-[#00faee]`, glow: '0 0 15px #00faee' },
  trial: { bg: `fill-[#00faee]/60`, border: `stroke-[#00faee]/60`, text: `text-[#00faee]/80`, glow: '0 0 8px #00faee60' },
  assess: { bg: `fill-zinc-700`, border: `stroke-zinc-600`, text: `text-zinc-400`, glow: 'none' },
  hold: { bg: `fill-rose-900/40`, border: `stroke-rose-500/50`, text: `text-rose-500`, glow: '0 0 10px #f43f5e30' },
};

const quadrantLabels = {
  adopt: 'ADOPT',
  trial: 'TRIAL',
  assess: 'ASSESS',
  hold: 'HOLD',
};

const quadrantDescriptions = {
  adopt: 'Strongly recommended for use',
  trial: 'Worth pursuing in projects',
  assess: 'Exploring and researching',
  hold: 'Proceed with caution',
};

export function TechRadar({ data, onItemClick }: TechRadarProps) {
  const groupedItems = useMemo(() => {
    return data.items.reduce((acc, item) => {
      if (!acc[item.quadrant]) acc[item.quadrant] = [];
      acc[item.quadrant].push(item);
      return acc;
    }, {} as Record<string, TechRadarItem[]>);
  }, [data.items]);

  const quadrants = ['adopt', 'trial', 'assess', 'hold'] as const;

  return (
    <div className="space-y-8 bg-[#000] p-4 rounded-3xl">
      {/* Radar Visualization */}
      <div className="relative aspect-square max-w-2xl mx-auto bg-[#020202] rounded-full border border-[#111] shadow-2xl overflow-hidden">
        <svg viewBox="0 0 400 400" className="w-full h-full p-4">
          <defs>
            <filter id="blipGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rings - Tactical Scan Lines */}
          {[1, 2, 3, 4].map((ring) => (
            <circle
              key={ring}
              cx="200"
              cy="200"
              r={ring * 45}
              fill="none"
              stroke="#1a1a1a"
              strokeWidth="1"
              strokeDasharray={ring === 4 ? "0" : "4 4"}
            />
          ))}
          
          {/* Quadrant Axis Lines */}
          <line x1="200" y1="20" x2="200" y2="380" stroke="#1a1a1a" strokeWidth="1" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="#1a1a1a" strokeWidth="1" />
          
          {/* Interactive Quadrant labels */}
          <text x="310" y="90" className="text-[10px] font-black tracking-widest fill-[#00faee] opacity-40">ADOPT</text>
          <text x="310" y="315" className="text-[10px] font-black tracking-widest fill-zinc-600">TRIAL</text>
          <text x="40" y="315" className="text-[10px] font-black tracking-widest fill-zinc-600">ASSESS</text>
          <text x="40" y="90" className="text-[10px] font-black tracking-widest fill-rose-900">HOLD</text>
          
          {/* Technology blips */}
          {data.items.map((item, index) => {
            const angle = ((index * 137.5) % 360) * (Math.PI / 180);
            const radius = 30 + item.ring * 40;
            const quadrantOffset = {
              adopt: { x: 1, y: -1 },
              trial: { x: 1, y: 1 },
              assess: { x: -1, y: 1 },
              hold: { x: -1, y: -1 },
            };
            const offset = quadrantOffset[item.quadrant];
            const x = 200 + offset.x * Math.abs(Math.cos(angle)) * radius;
            const y = 200 + offset.y * Math.abs(Math.sin(angle)) * radius;
            
            return (
              <motion.g
                key={item.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.5 }}
                transition={{ duration: 0.3 }}
                onClick={() => onItemClick?.(item)}
                className="cursor-pointer group"
              >
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  className="transition-all duration-300"
                  fill={item.quadrant === 'adopt' ? ACCENT : item.quadrant === 'hold' ? '#f43f5e' : '#3f3f46'}
                  filter={item.quadrant === 'adopt' ? "url(#blipGlow)" : ""}
                />
                <circle
                   cx={x}
                   cy={y}
                   r="10"
                   fill="transparent"
                   className="stroke-[#00faee20] stroke-1 opacity-0 group-hover:opacity-100"
                />
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* Quadrant Lists - Pure Dark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map((quadrant) => (
          <motion.div
            key={quadrant}
            className={cn(
              "rounded-xl border bg-[#020202] p-5 transition-all duration-500",
              quadrant === 'adopt' ? "border-[#00faee30]" : "border-[#1a1a1a]"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={cn("font-black text-sm tracking-widest", quadrantColors[quadrant].text)}>
                  {quadrantLabels[quadrant]}
                </h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">
                  {quadrantDescriptions[quadrant]}
                </p>
              </div>
              <Badge className="bg-[#111] text-zinc-400 border-[#1a1a1a] font-mono text-xs">
                {groupedItems[quadrant]?.length || 0}
              </Badge>
            </div>
            
            <div className="space-y-1">
              {groupedItems[quadrant]?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onItemClick?.(item)}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#080808] hover:bg-[#111] group cursor-pointer border border-transparent hover:border-[#222] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: quadrant === 'adopt' ? ACCENT : '#333' }}
                    />
                    <span className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    {item.moved && item.moved !== 'none' && (
                       <span className={item.moved === 'up' ? 'text-[#00faee]' : 'text-rose-500'}>
                        {item.moved === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors uppercase">
                    <span className="font-mono">{item.repo_count.toLocaleString()} units</span>
                    <span className={cn(
                      "font-mono",
                      item.growth_rate > 0 ? 'text-[#00faee]' : 'text-rose-900'
                    )}>
                      {item.growth_rate > 0 ? '+' : ''}{item.growth_rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dark Insights Panel */}
      <motion.div
        className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ACCENT }} />
        <h3 className="font-black text-xs tracking-[0.3em] uppercase mb-6 text-zinc-500">Intelligence Insights</h3>
        <div className="grid gap-8 md:grid-cols-3 relative z-10">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-3 tracking-widest">Emerging Trends</p>
            <ul className="space-y-3">
              {data.insights.emerging_trends.map((trend, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-start gap-3">
                  <span style={{ color: ACCENT }} className="text-lg leading-none mt-1">›</span>
                  {trend}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-3 tracking-widest">Market Maturity</p>
            <p className="text-zinc-200 font-bold leading-relaxed">{data.insights.market_maturity}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-3 tracking-widest">Innovation Velocity</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black font-mono tracking-tighter" style={{ color: ACCENT }}>
                {data.insights.innovation_velocity}
              </span>
              <span className="text-sm text-zinc-700 font-black">/ 10.0</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}