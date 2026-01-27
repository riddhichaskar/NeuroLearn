import { Search, Bell, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Your core brand color
const ACCENT = "#00faee";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-black/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">
              {title}
            </h1>
            {description && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Box with Accent Focus */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              placeholder="System Search..."
              className={cn(
                "w-72 pl-9 pr-12 h-9 text-xs rounded-lg transition-all duration-300",
                "bg-[#0a0a0a] border-[#1a1a1a] text-zinc-300 placeholder:text-zinc-600",
                "focus-visible:ring-1 focus-visible:ring-[#00faee50] focus-visible:border-[#00faee50]"
              )}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-[#1a1a1a] bg-black px-1.5 font-mono text-[9px] font-bold text-zinc-500 sm:flex uppercase">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>

          {/* Separator Line */}
          <div className="h-4 w-[1px] bg-[#1a1a1a] mx-1" />

          {/* Notifications with Accent Badge */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <Bell className="h-5 w-5" />
            <span 
              className="absolute top-1 right-1 h-2 w-2 rounded-full animate-pulse"
              style={{ 
                backgroundColor: ACCENT,
                boxShadow: `0 0 8px ${ACCENT}` 
              }}
            />
          </Button>

          {/* Custom Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}