import { motion } from 'framer-motion';
import { Activity, Server, Database, Zap, Clock, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockSystemMetrics, mockSystemHealth } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Core brand color
const ACCENT = "#00faee";

const statusConfig = {
  up: { icon: CheckCircle, color: 'text-[#00faee]', bg: 'bg-[#00faee]/10', border: 'border-[#00faee]/20', label: 'OPERATIONAL' },
  degraded: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'DEGRADED' },
  down: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'OFFLINE' },
};

const SystemHealth = () => {
  const handleClearCache = () => {
    // Logic to clear system cache
  };

  return (
    <DashboardLayout 
      title="System Telemetry" 
      description="Real-time monitoring of neural nodes and service integrity"
      actions={
        <Button 
          variant="outline" 
          className="gap-2 border-[#1a1a1a] bg-transparent text-zinc-500 hover:text-white hover:border-[#00faee40] transition-all" 
          onClick={handleClearCache}
        >
          <Trash2 className="h-4 w-4" />
          Purge Cache
        </Button>
      }
    >
      <div className="space-y-8 bg-black min-h-screen">
        
        {/* Overall Status - Pure Dark Refactor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-2xl border p-8 flex items-center justify-between relative overflow-hidden",
            mockSystemHealth.status === 'healthy' ? "border-[#00faee30] bg-[#00faee]/5" : 
            mockSystemHealth.status === 'degraded' ? "border-amber-500/20 bg-amber-500/5" : 
            "border-rose-500/20 bg-rose-500/5"
          )}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#00faee]/5 blur-[60px] pointer-events-none" />

          <div className="flex items-center gap-6 relative z-10">
            {mockSystemHealth.status === 'healthy' ? (
              <div className="p-3 rounded-full bg-[#00faee20] shadow-[0_0_20px_rgba(0,250,238,0.2)]">
                <CheckCircle className="h-10 w-10 text-[#00faee]" />
              </div>
            ) : mockSystemHealth.status === 'degraded' ? (
              <div className="p-3 rounded-full bg-amber-500/20">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
              </div>
            ) : (
              <div className="p-3 rounded-full bg-rose-500/20">
                <XCircle className="h-10 w-10 text-rose-500" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                SYSTEM {mockSystemHealth.status}
              </h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
                Ecosystem integrity check complete
              </p>
            </div>
          </div>
          <Badge 
            className={cn(
              "font-mono text-[10px] font-black tracking-widest py-1.5 px-4 border",
              mockSystemHealth.status === 'healthy' && "bg-[#00faee10] text-[#00faee] border-[#00faee30]",
              mockSystemHealth.status === 'degraded' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
              mockSystemHealth.status === 'unhealthy' && "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}
          >
            {mockSystemHealth.services.filter(s => s.status === 'up').length} / {mockSystemHealth.services.length} NODES_ACTIVE
          </Badge>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'API Uptime', value: `${mockSystemMetrics.api_uptime}%`, icon: Activity, color: ACCENT },
            { label: 'Cache Hit Rate', value: `${mockSystemMetrics.cache_hit_rate}%`, icon: Database, color: ACCENT },
            { label: 'Avg Latency', value: `${mockSystemMetrics.avg_response_time}ms`, icon: Clock, color: 'text-amber-500' },
            { label: 'Throughput', value: mockSystemMetrics.requests_per_minute.toLocaleString(), icon: Zap, color: ACCENT },
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-[#1a1a1a] bg-[#020202] p-6 group hover:border-[#00faee30] transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="rounded-xl p-2.5 transition-colors"
                  style={{ backgroundColor: `${metric.color === ACCENT ? ACCENT : '#f59e0b'}10` }}
                >
                  <metric.icon className="h-5 w-5" style={{ color: metric.color === ACCENT ? ACCENT : '#f59e0b' }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">{metric.label}</span>
              </div>
              <p className="text-3xl font-black font-mono tracking-tighter text-white">
                {metric.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Tactical Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: 'Active Neural Jobs', value: mockSystemMetrics.active_jobs },
            { label: 'Indexed Repositories', value: mockSystemMetrics.total_repos.toLocaleString() },
            { label: 'Tracked Ecosystems', value: mockSystemMetrics.total_technologies },
            { label: 'Last Telemetry Sync', value: new Date(mockSystemMetrics.last_sync).toLocaleTimeString() },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (i * 0.1) }}
              className="rounded-xl border border-[#111] bg-[#050505] p-5"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">{item.label}</p>
              <p className="text-xl font-bold font-mono text-zinc-300">{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Service Status List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-[#1a1a1a] bg-[#020202] overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#111] bg-[#050505]">
            <div className="flex items-center gap-3">
              <Server className="h-4 w-4 text-[#00faee]" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Neural Service Mesh</h3>
            </div>
          </div>

          <div className="divide-y divide-[#111]">
            {mockSystemHealth.services.map((service, index) => {
              const config = statusConfig[service.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-6 hover:bg-white/[0.01] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn("rounded-xl p-3 border", config.bg, config.border)}>
                      <StatusIcon className={cn("h-5 w-5", config.color)} />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-200 uppercase text-sm tracking-tight">{service.name}</p>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase mt-1">
                        Last ping: {new Date(service.last_check).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-black font-mono text-zinc-100">{service.latency}ms</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">latency</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] font-black uppercase tracking-[0.1em] py-1 px-3 border",
                        config.color,
                        config.border
                      )}
                    >
                      {config.label}
                    </Badge>
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

export default SystemHealth;