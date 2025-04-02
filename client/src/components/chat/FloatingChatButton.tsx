import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
// Define the useClickAway hook directly since we won't be using it elsewhere
function useClickAway(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  
  // Use a custom hook to detect clicks outside the chat window
  useClickAway(chatRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div 
          ref={chatRef}
          className="absolute bottom-16 right-0 w-[400px] h-[600px] bg-[#1A1A2E] border border-[#2A2A3A] rounded-lg shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between bg-[#20223A] px-4 py-3 border-b border-[#2A2A3A]">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-[#00F5D4]/20 border border-[#00F5D4]/30 flex items-center justify-center text-[#00F5D4]">
                <Bot size={16} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#F8F9FA]">RezGuru Assistant</h3>
                <p className="text-xs text-[#F8F9FA]/50">Your real estate AI companion</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-[#F8F9FA]/70 hover:bg-[#2A2A3A] hover:text-[#00F5D4]"
            >
              <X size={18} />
            </Button>
          </div>
          <div className="h-[calc(100%-52px)]">
            <ChatInterface />
          </div>
        </div>
      )}
      
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-[#6E56CF] to-[#00F5D4] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      >
        <Bot size={24} />
      </Button>
    </div>
  );
}