import { Search, RefreshCw, Sun, Moon, Menu, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onMenuToggle: () => void;
}

export const Header = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
  theme,
  onThemeToggle,
  onMenuToggle,
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    // Theme: Dark background (black/80) with subtle white/10 border
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          // Theme: Gray default, Cyan hover
          className="lg:hidden text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="/logoimg.png"
            alt="DevNews Logo"
            className="h-8 w-8 rounded-lg object-contain"
          />
          <span className="hidden text-xl font-bold text-white sm:inline-block">
            DevNews
          </span>
        </div>

        {/* Home Button - Added on the right side of DevNews */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          aria-label="Go to Home"
          // Theme: Gray default, Cyan hover, consistent with other buttons
          className="ml-1 text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10"
        >
          <Home className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="relative ml-4 flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="search"
            placeholder="Search articles, topics, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            // Theme: Dark Input, White Text, Cyan Focus Ring
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#00FFFF] focus-visible:border-[#00FFFF]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh news"
            // Theme: Gray default, Cyan hover
            className="text-gray-400 hover:text-[#00FFFF] hover:bg-[#00FFFF]/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#00FFFF]' : ''}`} />
          </Button>
        </div>
      </div>
    </header>
  );
};