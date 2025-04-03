import { Link, useLocation } from "wouter";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Sidebar({ isOpen, onClose, theme, onToggleTheme }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "fas fa-chart-pie" },
    { name: "Leads", path: "/leads", icon: "fas fa-user-tag" },
    { name: "Automations", path: "/automations", icon: "fas fa-robot" },
    { name: "Documents", path: "/documents", icon: "fas fa-file-alt" },
    { name: "Data Sources", path: "/scraping", icon: "fas fa-database" },
  ];
  
  const settings = [
    { name: "Settings", path: "/settings", icon: "fas fa-cog" },
    { name: "Help", path: "/help", icon: "fas fa-question-circle" },
  ];
  
  const isActive = (path: string) => {
    if (path === "/dashboard" && location === "/") {
      return true;
    }
    return location === path;
  };
  
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 w-72 border-r border-[#2A2A3A] transition-all duration-300 transform z-30 shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      
      {/* Logo Area */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-[#2A2A3A]">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded bg-[#6E56CF]/20 border border-[#6E56CF]/30 flex items-center justify-center text-[#00F5D4] mr-3">
            <i className="fas fa-satellite-dish text-lg"></i>
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] bg-clip-text text-transparent">RezGuru AI</span>
            <p className="monospace-text text-[#F8F9FA]/50">Real Estate Platform</p>
          </div>
        </div>
        <Button 
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="lg:hidden text-[#F8F9FA] hover:bg-[#2A2A3A] hover:text-[#00F5D4]">
          <i className="fas fa-times"></i>
        </Button>
      </div>
      
      {/* System Status Indicator */}
      <div className="mx-4 mt-4 px-3 py-2 bg-[#20223A] rounded border border-[#2A2A3A] text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#F8F9FA]/70 monospace-text">Platform Status</span>
          <span className="highlight-text monospace-text">Active</span>
        </div>
        <div className="mt-2 h-1 bg-[#2A2A3A] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] w-[85%]"></div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-4 px-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link 
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded group transition-all duration-200 card-hover",
                isActive(item.path)
                  ? "bg-[#20223A] text-[#F8F9FA] font-medium card-active"
                  : "text-[#F8F9FA]/70 hover:bg-[#20223A]/80 hover:text-[#F8F9FA]"
              )}>
              <div className={cn(
                "h-8 w-8 rounded flex items-center justify-center mr-3",
                isActive(item.path) 
                  ? "bg-[#6E56CF]/20 text-[#00F5D4] border border-[#6E56CF]/30" 
                  : "bg-[#20223A] text-[#F8F9FA]/70 group-hover:text-[#00F5D4]"
              )}>
                <i className={item.icon}></i>
              </div>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#F8F9FA]/50 monospace-text">CONFIGURATION</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleTheme} 
              className="h-7 w-7 rounded text-[#F8F9FA]/70 hover:text-[#00F5D4] hover:bg-[#20223A]"
            >
              {theme === 'dark' ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </Button>
          </div>
          <div className="mt-2 space-y-1">
            {settings.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded group transition-all duration-200 card-hover",
                  isActive(item.path)
                    ? "bg-[#20223A] text-[#F8F9FA] font-medium card-active"
                    : "text-[#F8F9FA]/70 hover:bg-[#20223A]/80 hover:text-[#F8F9FA]"
                )}>
                <div className={cn(
                  "h-8 w-8 rounded flex items-center justify-center mr-3",
                  isActive(item.path) 
                    ? "bg-[#6E56CF]/20 text-[#00F5D4] border border-[#6E56CF]/30" 
                    : "bg-[#20223A] text-[#F8F9FA]/70 group-hover:text-[#00F5D4]"
                )}>
                  <i className={item.icon}></i>
                </div>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User Menu */}
      <div className="absolute bottom-0 w-full border-t border-[#2A2A3A] p-4">
        <div className="flex items-center sidebar-card card-hover">
          <div className="h-10 w-10 rounded bg-[#6E56CF]/20 border border-[#6E56CF]/30 text-[#6E56CF] flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-[#F8F9FA]">{user?.fullName || user?.username || "User"}</p>
            <p className="monospace-text text-[#F8F9FA]/50">{user?.plan === "premium" ? "Premium Account" : "Free Account"}</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded text-[#F8F9FA]/70 hover:text-[#00F5D4] hover:bg-[#2A2A3A]">
                <i className="fas fa-ellipsis-v"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1A1A2E] border-[#2A2A3A] text-[#F8F9FA]">
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer hover:bg-[#2A2A3A] hover:text-[#00F5D4]">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#2A2A3A]" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-[#2A2A3A] hover:text-[#00F5D4] focus:bg-[#2A2A3A]"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
