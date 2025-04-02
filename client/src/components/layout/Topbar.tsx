import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { cn } from "../../lib/utils";

interface TopbarProps {
  onOpenSidebar: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Topbar({ onOpenSidebar, theme, onToggleTheme }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="sticky top-0 z-20 bg-[#1A1A2E] border-b border-[#2A2A3A] transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Menu Button */}
        <Button 
          onClick={onOpenSidebar} 
          variant="ghost"
          size="icon"
          className="lg:hidden text-[#F8F9FA] hover:bg-[#2A2A3A] hover:text-[#00F5D4]">
          <i className="fas fa-bars text-lg"></i>
        </Button>
        
        {/* Command Center Header */}
        <div className="hidden lg:flex items-center space-x-3 text-sm">
          <span className="highlight-text monospace-text font-bold">[GURU-COMMAND]</span>
          <i className="fas fa-chevron-right text-xs mx-1 text-muted-foreground"></i>
          <span className="tactical-badge">TACTICAL_DASHBOARD</span>
          <div className="status-badge-active ml-2">
            OPERATIONAL
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#6E56CF]">
              <i className="fas fa-search text-sm"></i>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 bg-[#20223A] border-[#2A2A3A] h-9 rounded text-[#F8F9FA] placeholder:text-[#CCCED0]/70 card-hover focus:border-[#6E56CF] focus:ring-1 focus:ring-[#6E56CF]"
              placeholder="Search targets, assets, operations..."
            />
          </div>
        </div>
        
        {/* Right Navigation */}
        <div className="flex items-center">
          <div className="hidden sm:flex mr-4 text-sm">
            <div className="flex items-center bg-[#20223A] px-2 py-1 rounded border border-[#2A2A3A]">
              <div className="animate-pulse h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-xs text-[#F8F9FA]/80 monospace-text">SYSTEM ONLINE</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="relative text-[#F8F9FA] hover:bg-[#2A2A3A] hover:text-[#00F5D4]">
            <i className="fas fa-bell"></i>
            <span className="absolute top-0 right-0 w-2 h-2 bg-[#00F5D4] rounded-full"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleTheme}
            className="ml-2 text-[#F8F9FA] hover:bg-[#2A2A3A] hover:text-[#00F5D4]">
            {theme === 'dark' ? (
              <i className="fas fa-sun"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
          </Button>
          
          <div className="ml-3 relative">
            <Button 
              variant="ghost" 
              className="p-0 h-9 w-9 bg-[#6E56CF]/20 text-[#6E56CF] hover:bg-[#6E56CF]/30 border border-[#6E56CF]/30 rounded"
            >
              <i className="fas fa-user text-sm"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
