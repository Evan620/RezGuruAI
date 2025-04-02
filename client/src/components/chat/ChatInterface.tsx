import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, Bot, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Message type similar to server's AIMessage
interface ChatMessage {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
  toolCalls?: {
    name: string;
    arguments: any;
    response: any;
  }[];
}

// The main ChatInterface component
export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hello, I'm Guru, your real estate AI assistant. How can I help you today?"
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Send a message to the server and handle the response
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add the user's message to the chat
    const userMessage: ChatMessage = {
      role: "user",
      content: inputValue
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Only send the last few messages for context, including the new user message
      const contextMessages = [...messages.slice(-5), userMessage];
      
      // Send to the server
      const response = await apiRequest(
        "POST",
        "/api/ai/chat",
        { messages: contextMessages }
      );
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response message and tool calls
      const { message, toolCalls, error } = data;
      
      if (error) {
        console.error("Error from AI service:", error);
        toast({
          title: "Error",
          description: "There was an error processing your message. Please try again.",
          variant: "destructive",
        });
        
        // Still add the message to show something happened
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: "I'm sorry, I encountered an error processing your request. Please try again."
          }
        ]);
      } else {
        // Add the assistant's message to the chat
        setMessages((prev) => [...prev, message]);
        
        // If there were tool calls, you could display them in a more detailed way
        if (toolCalls && toolCalls.length > 0) {
          console.log("Tool calls:", toolCalls);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
      
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          content: "I'm sorry, there was an error sending your message. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pressing Enter to send
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render a single message
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    
    return (
      <div 
        key={index} 
        className={`flex items-start gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""}`}
      >
        <Avatar className={`${isUser ? "bg-violet-600" : "bg-teal-500"} text-background`}>
          <div className="h-full w-full flex items-center justify-center">
            {isUser ? <User size={18} /> : <Bot size={18} />}
          </div>
        </Avatar>
        
        <Card 
          className={`py-3 px-4 max-w-[80%] ${
            isUser 
              ? "bg-violet-600/10 border-violet-600/20" 
              : isAssistant 
                ? "bg-teal-500/10 border-teal-500/20"
                : "bg-gray-800/50 border-gray-700"
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
          
          {/* If there were tool calls, you could render them here */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-400">
              <div>Actions taken:</div>
              {message.toolCalls.map((tool, idx) => (
                <div key={idx} className="mt-1">
                  • {tool.name.replace(/_/g, " ")}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm rounded-lg border border-border p-4">
      <div className="flex-1 mb-4 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-260px)] pr-4">
          <div className="flex flex-col">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      <div className="flex items-end gap-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="min-h-[80px] resize-none bg-background"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage} 
          size="icon" 
          className="h-10 w-10 bg-violet-600 hover:bg-violet-700 text-white"
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}