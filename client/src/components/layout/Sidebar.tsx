import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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
        "fixed inset-y-0 left-0 w-64 bg-primary-800 text-white transition duration-200 transform z-30",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      
      {/* Logo Area */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-primary-700">
        <div className="flex items-center">
          <i className="fas fa-home-alt text-accent-500 text-xl mr-2"></i>
          <span className="font-bold text-lg">RezGuru AI</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden text-white hover:text-gray-300 focus:outline-none">
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6 px-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link 
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-base rounded-md group",
                isActive(item.path)
                  ? "bg-primary-700 text-white"
                  : "text-gray-300 hover:bg-primary-700 hover:text-white"
              )}>
              <i className={cn(
                item.icon, 
                "mr-3",
                isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-white"
              )}></i>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h3>
          <div className="mt-2 space-y-1">
            {settings.map((item) => (
              <Link 
                key={item.name}
                href={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-base rounded-md group",
                  isActive(item.path)
                    ? "bg-primary-700 text-white"
                    : "text-gray-300 hover:bg-primary-700 hover:text-white"
                )}>
                <i className={cn(
                  item.icon, 
                  "mr-3",
                  isActive(item.path) ? "text-white" : "text-gray-400 group-hover:text-white"
                )}></i>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User Menu */}
      <div className="absolute bottom-0 w-full border-t border-primary-700">
        <div className="flex items-center px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
            <i className="fas fa-user text-sm"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Alex Morgan</p>
            <p className="text-xs font-medium text-gray-300">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
