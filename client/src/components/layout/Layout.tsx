import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useLocalStorage } from "../../hooks/use-local-storage";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [theme, setTheme] = useLocalStorage<"dark" | "light">("theme", "dark");
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="h-screen flex flex-col bg-[#1A1A2E]">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={handleCloseSidebar} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <div className="lg:pl-72 flex flex-col flex-1 min-h-screen transition-colors duration-300">
        <Topbar 
          onOpenSidebar={handleOpenSidebar} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6E56CF] via-[#00F5D4] to-[#6E56CF] opacity-80"></div>
          {children}
          
          <footer className="mt-12 border-t border-[#2A2A3A] pt-4 text-xs text-gray-500">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[#00F5D4] font-mono">[CLASSIFIED]</span> RezGuru AI Command Center
              </div>
              <div className="text-right font-mono">
                <div className="text-gray-500">MISSION STATUS: <span className="text-green-400">ACTIVE</span></div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
