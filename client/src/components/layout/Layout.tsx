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
    <div className="h-screen flex flex-col bg-background">
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
        
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
