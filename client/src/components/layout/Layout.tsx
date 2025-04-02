import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="h-screen flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen bg-gray-50">
        <Topbar onOpenSidebar={handleOpenSidebar} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
