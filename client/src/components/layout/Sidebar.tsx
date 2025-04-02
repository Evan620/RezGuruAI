import { Link, useLocation } from "wouter";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Sidebar({ isOpen, onClose, theme, onToggleTheme }: SidebarProps) {
  const [location] = useLocation();
  
  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: "fas fa-chart-pie" },
    { name: "Leads", path: "/leads", icon: "fas fa-users" },
    { name: "Automations", path: "/automations", icon: "fas fa-robot" },
    { name: "Documents", path: "/documents", icon: "fas fa-file-alt" },
    { name: "Data Scraping", path: "/scraping", icon: "fas fa-spider" },
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
        "fixed inset-y-0 left-0 w-72 bg-background border-r border-border transition-all duration-300 transform z-30 shadow-lg dark:shadow-primary/10",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      
      {/* Logo Area */}
      <div className="flex items-center justify-between px-6 h-20 border-b">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white mr-3">
            <i className="fas fa-home-alt text-lg"></i>
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">RezGuru AI</span>
            <p className="text-xs text-muted-foreground">Real Estate Intelligence</p>
          </div>
        </div>
        <Button 
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="lg:hidden">
          <i className="fas fa-times"></i>
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-4">
        <div className="space-y-1.5">
          {navigation.map((item) => (
            <Link 
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-lg group transition-all duration-200",
                isActive(item.path)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
              <div className={cn(
                "h-8 w-8 rounded-md flex items-center justify-center mr-3",
                isActive(item.path) 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground group-hover:bg-accent/50 group-hover:text-foreground"
              )}>
                <i className={item.icon}></i>
              </div>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground">Settings</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleTheme} 
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </Button>
          </div>
          <div className="mt-2 space-y-1.5">
            {settings.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm rounded-lg group transition-all duration-200",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}>
                <div className={cn(
                  "h-8 w-8 rounded-md flex items-center justify-center mr-3",
                  isActive(item.path) 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted text-muted-foreground group-hover:bg-accent/50 group-hover:text-foreground"
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
      <div className="absolute bottom-0 w-full border-t p-4">
        <div className="flex items-center bg-accent/50 rounded-lg p-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <i className="fas fa-user"></i>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">Alex Morgan</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground">
            <i className="fas fa-cog"></i>
          </Button>
        </div>
      </div>
    </aside>
  );
}
