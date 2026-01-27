import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Cpu,
  TrendingUp,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { RepoCard } from '@/components/dashboard/RepoCard';
import { TechnologyCard } from '@/components/dashboard/TechnologyCard';
import {
  mockRepositories,
  mockTechnologies,
  mockChartData,
} from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Core brand color
const ACCENT = '#00faee';

const Dashboard = () => {
  const topRepos = useMemo(() => mockRepositories.slice(0, 4), []);
  const topTechnologies = useMemo(() => mockTechnologies.slice(0, 6), []);

  return (
    <DashboardLayout
      title="Intelligence Hub"
      description="Global GitHub ecosystem telemetry"
      actions={
        <Button
          className="gap-2 px-6 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all hover:brightness-110"
          style={{
            backgroundColor: ACCENT,
            color: '#000',
            boxShadow: `0 0 20px ${ACCENT}30`,
          }}
        >
          <Zap className="h-4 w-4 fill-current" />
          Sync Neural Data
        </Button>
      }
    >
      {/* Main content */}
      <div className="space-y-8 min-h-screen pb-10">
        {/* KPI Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard label="Total Repositories" value="125.6K" change={12.5} trend="up" icon={<Database className="h-5 w-5" />} />
          <KPICard label="Active Technologies" value="342" change={8.3} trend="up" icon={<Cpu className="h-5 w-5" />} />
          <KPICard label="Trending Nodes" value="1,247" change={-2.1} trend="down" icon={<TrendingUp className="h-5 w-5" />} />
          <KPICard label="Growth Velocity" value="24.7%" change={5.2} trend="up" icon={<Zap className="h-5 w-5" />} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Technology Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border bg-card p-6 shadow-card"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Technology Trends</h3>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground uppercase">
                  7-Month Growth Projection
                </p>
              </div>
              <Badge className="border bg-accent text-primary font-mono text-[10px]">LIVE_SYNC</Badge>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData.technologyTrends}>
                  <defs>
                    <linearGradient id="colorAccent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
                  <YAxis tickLine={false} axisLine={false} fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '10px',
                    }}
                  />
                  <Area type="monotone" dataKey="typescript" stroke={ACCENT} fill="url(#colorAccent)" strokeWidth={3} />
                  <Area type="monotone" dataKey="rust" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Language Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-card p-6 flex flex-col shadow-card"
          >
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural Language Map</h3>
              <p className="mt-1 text-[10px] font-bold text-muted-foreground uppercase">
                Ecosystem dominance share
              </p>
            </div>

            <div className="relative flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockChartData.languageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockChartData.languageDistribution.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? ACCENT : 'hsl(var(--muted))'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-muted-foreground uppercase">Primary</span>
                <span className="text-2xl font-black text-primary">JS/TS</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Data Feeds */}
        <div className="space-y-4">
          <div className="flex items-end justify-between px-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em]">Active Nodes</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Top 168h performance</p>
            </div>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest">
              View All <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {topRepos.map((repo, index) => (
              <RepoCard key={repo.id} repo={repo} index={index} compact />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between px-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.3em]">Emerging Clusters</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">High velocity stacks</p>
            </div>
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest">
              Catalog <ArrowUpRight className="ml-2 h-3 w-3" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topTechnologies.map((tech, index) => (
              <TechnologyCard key={tech.id} tech={tech} index={index} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
