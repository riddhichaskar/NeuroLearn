import { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Layers, 
  GitBranch,
  MessageSquare,
  Swords,
  Sparkles,
  PlayCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  FolderKanban, 
  LineChart,    
  GitCompare,
  Home // 2. Import Home Icon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Your core brand color
const ACCENT = "#00faee";

// 1. Define Navigation Configurations for each section
const githubNav = [
  { name: 'Dashboard', href: '/github-intel', icon: LayoutDashboard },
  { name: 'Trending Repos', href: '/github-intel/trending', icon: TrendingUp },
  { name: 'Technologies', href: '/github-intel/technologies', icon: BarChart3 },
  { name: 'Tech Radar', href: '/github-intel/tech-radar', icon: Target },
  { name: 'Categories', href: '/github-intel/categories', icon: Layers },
  { name: 'Repository', href: '/github-intel/repository', icon: GitBranch },
  { name: 'Sentiment', href: '/github-intel/sentiment', icon: MessageSquare },
  { name: 'Competitors', href: '/github-intel/competitors', icon: Swords },
  { name: 'AI Tools', href: '/github-intel/ai-tools', icon: Sparkles },
  { name: 'Ingestion', href: '/github-intel/ingestion', icon: PlayCircle },
  { name: 'System Health', href: '/github-intel/system', icon: Activity },
];

const techTrendsNav = [
  { name: 'Dashboard', href: '/tech-trends', icon: LayoutDashboard },
  { name: 'Stack Explorer', href: '/tech-trends/stacks', icon: Layers },
  { name: 'Categories', href: '/tech-trends/categories', icon: FolderKanban },
  { name: 'Forecast', href: '/tech-trends/forecast', icon: LineChart },
  { name: 'Compare', href: '/tech-trends/compare', icon: GitCompare },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate(); // 3. Initialize hook

  // 2. Dynamically determine which navigation to show based on the current URL
  const { currentNav, sectionTitle } = useMemo(() => {
    const path = location.pathname;

    if (path.startsWith('/tech-trends')) {
      return { 
        currentNav: techTrendsNav, 
        sectionTitle: 'Tech_Trends' 
      };
    }
    
    // Default to GitHub Intel for /github-intel paths or as a fallback
    return { 
      currentNav: githubNav, 
      sectionTitle: 'Intel_Core' 
    };
  }, [location.pathname]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-[#1a1a1a]",
        "bg-black flex flex-col"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center px-4 border-b border-[#111]">
        <div 
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 overflow-hidden group"
          style={{ 
            backgroundColor: `${ACCENT}05`,
            border: `1px solid ${ACCENT}20`,
            boxShadow: `0 0 15px ${ACCENT}10`
          }}
        >
          <img 
            src="/logoimg.png" 
            alt="Logo" 
            className="h-7 w-7 object-contain transition-transform duration-500 group-hover:scale-110"
            style={{ filter: `drop-shadow(0 0 4px ${ACCENT}40)` }}
          />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-3 font-black text-xs uppercase tracking-[0.2em] text-white flex-1"
            >
              {/* Dynamic Title */}
              {sectionTitle}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Home Button added here (only visible when expanded) */}
        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => navigate('/')}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-[#111] rounded-lg transition-colors ml-auto"
              title="Return Home"
            >
              <Home className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <ul className="space-y-2">
          {/* Render the dynamic navigation list */}
          {currentNav.map((item) => {
            // Updated active check to handle sub-routes loosely if needed, or exact match
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href) && item.href !== '/github-intel' && item.href !== '/tech-trends');
            
            // Strict match for Dashboards to prevent them being active on all sub-pages
            const isStrictActive = location.pathname === item.href;

            return (
              <li key={item.name} className="relative">
                <NavLink
                  to={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition-all duration-300 uppercase tracking-wider",
                    isStrictActive 
                      ? "bg-[#111] text-white" 
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-[#0a0a0a]"
                  )}
                  style={isStrictActive ? { border: `1px solid ${ACCENT}20` } : {}}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isStrictActive ? "text-[#00faee]" : "group-hover:text-zinc-300"
                  )} 
                  style={isStrictActive ? { filter: `drop-shadow(0 0 5px ${ACCENT})` } : {}}
                  />
                  
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {isStrictActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute left-[-16px] w-1 h-6 rounded-r-full"
                      style={{ 
                        backgroundColor: ACCENT,
                        boxShadow: `0 0 15px ${ACCENT}` 
                      }}
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Toggle */}
      <div className="border-t border-[#111] p-4 bg-[#050505]">
        <Button
          variant="ghost"
          onClick={onToggle}
          className={cn(
            "w-full justify-start gap-4 text-zinc-500 hover:text-white hover:bg-[#111] rounded-xl transition-all",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Collapse System</span>
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
}