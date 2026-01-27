import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  LineChart,
  GitCompare,
  Menu,
  X,
  TrendingUp,
  Home, // Import Home icon
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Your accent color
const ACCENT_COLOR = '#00fae0'; 

// UPDATED: Paths now include the /tech-trends prefix to match your Router setup
const navigation = [
  { name: 'Dashboard', href: '/tech-trends', icon: LayoutDashboard },
  { name: 'Stack Explorer', href: '/tech-trends/stacks', icon: Layers },
  { name: 'Categories', href: '/tech-trends/categories', icon: FolderKanban },
  { name: 'Forecast', href: '/tech-trends/forecast', icon: LineChart },
  { name: 'Compare', href: '/tech-trends/compare', icon: GitCompare },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigation hook
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to determine if a link is active
  const isLinkActive = (href: string) => {
      if (href === '/tech-trends') {
          return location.pathname === href;
      }
      return location.pathname.startsWith(href);
  };

  return (
    // Applied bg-black and text-white for pure dark theme base
    <div className="min-h-screen flex w-full bg-black text-white">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-black border-r border-white/10">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-3 h-16 px-6 border-b border-white/10">
            {/* Logo Container with Accent Color */}
            <div 
              className="p-2 rounded-lg shadow-[0_0_15px_-3px_rgba(0,250,224,0.4)]"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <TrendingUp className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">TechTrend</span>
            
            {/* Desktop Home Button - Pushed to right with ml-auto */}
            <button 
              onClick={() => navigate('/')}
              className="ml-auto p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Return Home"
            >
              <Home className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = isLinkActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group',
                    isActive
                      ? 'text-black font-semibold' // Active text becomes black for contrast against accent
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg"
                      style={{ backgroundColor: ACCENT_COLOR }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {/* Icons need relative z-10 to sit on top of the motion background */}
                  <item.icon className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="px-3 py-3 rounded-lg bg-white/5 border border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Powered by</p>
              <p className="text-sm font-medium text-zinc-200">Prophet ML</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            <TrendingUp className="h-4 w-4 text-black" />
          </div>
          <span className="font-bold text-lg text-white">TechTrend</span>
          
          {/* Mobile Home Button - Placed next to title */}
          <button 
            onClick={() => navigate('/')}
            className="ml-2 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Return Home"
          >
            <Home className="h-5 w-5" />
          </button>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed inset-y-0 right-0 w-64 bg-black border-l border-white/10 z-40 pt-16 shadow-2xl shadow-black"
          >
            <nav className="px-4 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = isLinkActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                      isActive
                        ? 'text-black font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    )}
                    // Apply inline style for active background only on mobile
                    style={isActive ? { backgroundColor: ACCENT_COLOR } : {}}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:pl-64 bg-black min-h-screen">
        <div className="pt-16 lg:pt-0 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}