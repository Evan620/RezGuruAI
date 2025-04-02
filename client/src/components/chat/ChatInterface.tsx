import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Message types
type MessageType = "user" | "action" | "teach" | "error" | "system";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  showRetry?: boolean;
}

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: "# Welcome to RezGuru AI!\n\nI'm your personal real estate assistant. How can I help you today?",
      timestamp: new Date(),
      quickReplies: [
        "Find leads in my area",
        "Generate a purchase offer",
        "Set up a scraping job"
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Simulate API call to get chatbot response (to be replaced with actual API call)
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add a loading message
      const loadingMessageId = `action-${Date.now()}`;
      setMessages(prev => [...prev, {
        id: loadingMessageId,
        type: "action",
        content: "Processing your request...",
        timestamp: new Date()
      }]);
      
      // Simulate response delay - would be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== loadingMessageId));
      
      // Sample responses based on input - would be replaced with actual API response
      const lowerInput = inputValue.toLowerCase();
      
      // Simple demo responses based on keywords
      let responseMessage: Message;
      
      if (lowerInput.includes("find") && lowerInput.includes("lead")) {
        responseMessage = {
          id: `system-${Date.now()}`,
          type: "system",
          content: "I'll help you find high-quality leads. What area are you targeting?",
          timestamp: new Date(),
          quickReplies: ["Phoenix, AZ", "Miami, FL", "Dallas, TX"]
        };
      } else if (lowerInput.includes("generate") || lowerInput.includes("offer") || lowerInput.includes("contract")) {
        responseMessage = {
          id: `system-${Date.now()}`,
          type: "system",
          content: "I can generate a purchase offer for you. Which property do you want to make an offer on?",
          timestamp: new Date()
        };
      } else if (lowerInput.includes("tax") && lowerInput.includes("delinquent")) {
        responseMessage = {
          id: `teach-${Date.now()}`,
          type: "teach",
          content: "**📚 Guru Tip**: Tax-delinquent owners:\n- 23% more likely to sell below market\n- Average 11-month redemption period → **urgency leverage**\n\n*Want me to set up a tax-delinquent scraper?*",
          timestamp: new Date(),
          quickReplies: ["Yes", "No"]
        };
      } else if (lowerInput.includes("scrape") || lowerInput.includes("scraping")) {
        responseMessage = {
          id: `action-${Date.now()}`,
          type: "action",
          content: "Setting up a scraping job. Which data source would you like to scrape?",
          timestamp: new Date(),
          quickReplies: ["Tax Delinquent Records", "Probate Records", "Foreclosure Listings"]
        };
      } else if (lowerInput.includes("error") || lowerInput.includes("fail")) {
        responseMessage = {
          id: `error-${Date.now()}`,
          type: "error",
          content: "I encountered an error with that operation. It looks like the data source is temporarily unavailable.",
          timestamp: new Date(),
          showRetry: true
        };
      } else {
        responseMessage = {
          id: `system-${Date.now()}`,
          type: "system",
          content: "I'm here to help with your real estate needs. Would you like me to find leads, generate documents, or set up automation workflows?",
          timestamp: new Date(),
          quickReplies: ["Find leads", "Generate documents", "Set up workflow"]
        };
      }
      
      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: "error",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        showRetry: true
      }]);
      
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle quick reply selection
  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Handle retry for error messages
  const handleRetry = (messageId: string) => {
    // Find the user message that preceded this error
    const errorIndex = messages.findIndex(m => m.id === messageId);
    if (errorIndex <= 0) return;
    
    // Find the most recent user message before this error
    let userMessageIndex = errorIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].type !== "user") {
      userMessageIndex--;
    }
    
    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex];
      setInputValue(userMessage.content);
      setTimeout(() => {
        handleSendMessage();
      }, 100);
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("flex flex-col h-[600px] bg-[#1A1A2E] border border-[#2A2A3A] rounded-lg overflow-hidden", className)}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A3A]">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded bg-[#6E56CF]/20 border border-[#6E56CF]/30 flex items-center justify-center text-[#00F5D4] mr-3">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3 className="font-medium text-[#F8F9FA]">Guru AI Assistant</h3>
            <div className="flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4] mr-1.5"></span>
              <span className="text-xs text-[#CCCED0] monospace-text">ONLINE</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#2A2A3A]">
            <i className="fas fa-cog"></i>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#2A2A3A]">
            <i className="fas fa-expand-alt"></i>
          </Button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className="relative">
            {/* Different styling for each message type */}
            <div className={cn(
              "relative px-4 py-3 rounded-lg max-w-[90%]",
              message.type === "user" && "ml-auto bg-[#6E56CF] text-white",
              message.type === "system" && "mr-auto bg-[#20223A] text-[#F8F9FA] border border-[#2A2A3A]",
              message.type === "action" && "mr-auto bg-[#6E56CF]/20 text-[#F8F9FA] border border-[#6E56CF]/30",
              message.type === "teach" && "mr-auto bg-[#00F5D4]/10 text-[#F8F9FA] border border-[#00F5D4]/30",
              message.type === "error" && "mr-auto bg-[#FF6B6B]/10 text-[#F8F9FA] border border-[#FF6B6B]/30"
            )}>
              {/* Icon for specific message types */}
              {message.type === "teach" && (
                <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-[#00F5D4] text-[#1A1A2E] flex items-center justify-center">
                  <i className="fas fa-book text-xs"></i>
                </div>
              )}
              {message.type === "error" && (
                <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-xs"></i>
                </div>
              )}
              {message.type === "action" && (
                <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-[#6E56CF] text-white flex items-center justify-center">
                  <i className="fas fa-bolt text-xs"></i>
                </div>
              )}
              
              {/* Message content with simple markdown processing */}
              <div className="whitespace-pre-wrap">
                {message.content.split('\n').map((line, i) => {
                  // Basic markdown processing for headings
                  if (line.startsWith('# ')) {
                    return <h3 key={i} className="text-lg font-bold mb-2">{line.substring(2)}</h3>;
                  } else if (line.startsWith('## ')) {
                    return <h4 key={i} className="text-base font-bold mb-1">{line.substring(3)}</h4>;
                  }
                  // Basic markdown for bold
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={i} className="mb-1 last:mb-0">
                      {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={j}>{part.substring(2, part.length - 2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
              
              {/* Timestamp */}
              <div className={cn(
                "text-[10px] absolute",
                message.type === "user" ? "-left-16 top-2 text-[#CCCED0]" : "-right-16 top-2 text-[#CCCED0]"
              )}>
                {formatTime(message.timestamp)}
              </div>
            </div>
            
            {/* Quick replies */}
            {message.quickReplies && message.quickReplies.length > 0 && (
              <div className="mt-2 ml-2 flex flex-wrap gap-2">
                {message.quickReplies.map(reply => (
                  <Button
                    key={reply}
                    variant="outline"
                    className="h-8 text-xs bg-[#20223A] border-[#2A2A3A] text-[#F8F9FA] hover:bg-[#2A2A3A] hover:text-[#00F5D4]"
                    onClick={() => handleQuickReply(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            )}
            
            {/* Retry button for error messages */}
            {message.showRetry && (
              <div className="mt-2 ml-2">
                <Button
                  variant="outline"
                  className="h-8 text-xs bg-[#20223A] border-[#FF6B6B]/30 text-[#FF6B6B] hover:bg-[#2A2A3A]"
                  onClick={() => handleRetry(message.id)}
                >
                  <i className="fas fa-redo mr-1"></i> Retry
                </Button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-[#2A2A3A] p-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center"
        >
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message or try: 'Find leads in Phoenix with >80 score'"
            className="flex-1 bg-[#20223A] border-[#2A2A3A] h-10 text-[#F8F9FA] placeholder:text-[#CCCED0]/70 focus:border-[#6E56CF]"
            disabled={isLoading}
          />
          <Button 
            type="submit"
            className="ml-2 bg-[#6E56CF] hover:bg-[#5D46BD] text-white h-10"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </Button>
        </form>
        <div className="mt-2 px-2 text-xs text-[#CCCED0]/50 monospace-text">
          REZGURU SYSTEM v1.0 • TACTICAL AI ASSISTANT
        </div>
      </div>
    </div>
  );
}