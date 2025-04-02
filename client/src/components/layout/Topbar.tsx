import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onOpenSidebar: () => void;
}

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="sticky top-0 z-20 bg-white shadow">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Menu Button */}
        <Button 
          onClick={onOpenSidebar} 
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 lg:hidden focus:outline-none">
          <i className="fas fa-bars text-xl"></i>
        </Button>
        
        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-xl ml-6">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search leads, documents, automations..."
            />
          </div>
        </div>
        
        {/* Right Navigation */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-2 p-2 text-gray-500 hover:text-gray-700 relative">
            <i className="fas fa-bell"></i>
            <span className="absolute top-0 right-0 w-3 h-3 bg-accent-500 rounded-full"></span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="ml-2 p-2 text-gray-500 hover:text-gray-700">
            <i className="fas fa-cog"></i>
          </Button>
          <div className="ml-4 relative">
            <div>
              <Button variant="ghost" className="flex items-center text-sm p-0">
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                  <i className="fas fa-user text-sm"></i>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
