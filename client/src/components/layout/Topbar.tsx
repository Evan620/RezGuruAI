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
    <div className="sticky top-0 z-20 bg-background/60 backdrop-blur-md border-b transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Menu Button */}
        <Button 
          onClick={onOpenSidebar} 
          variant="ghost"
          size="icon"
          className="lg:hidden">
          <i className="fas fa-bars text-lg"></i>
        </Button>
        
        {/* Breadcrumb and Page Title */}
        <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Home</span>
          <i className="fas fa-chevron-right text-xs mx-2"></i>
          <span className="font-medium text-foreground">Dashboard</span>
        </div>
        
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <i className="fas fa-search text-sm"></i>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 bg-background border-border h-9 rounded-full"
              placeholder="Search leads, documents, automations..."
            />
          </div>
        </div>
        
        {/* Right Navigation */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-2 rounded-full relative">
            <i className="fas fa-bell"></i>
            <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleTheme}
            className="ml-2 rounded-full">
            {theme === 'dark' ? (
              <i className="fas fa-sun"></i>
            ) : (
              <i className="fas fa-moon"></i>
            )}
          </Button>
          
          <div className="ml-3 relative">
            <Button 
              variant="ghost" 
              className="rounded-full p-0 h-9 w-9 bg-primary/10 text-primary"
            >
              <i className="fas fa-user text-sm"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
