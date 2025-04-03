import { Workflow } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface WorkflowCardProps {
  workflow: Workflow;
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  // Get workflow step icons based on actions
  const workflowIcons = workflow.actions.map(action => {
    switch(action.type) {
      case "filter":
        return { icon: "fas fa-filter", bgColor: "bg-[#6E56CF]/20", textColor: "text-[#6E56CF]" };
      case "sms":
        return { icon: "fas fa-sms", bgColor: "bg-[#FF6B6B]/20", textColor: "text-[#FF6B6B]" };
      case "email":
        return { icon: "fas fa-envelope", bgColor: "bg-[#FF6B6B]/20", textColor: "text-[#FF6B6B]" };
      case "call":
        return { icon: "fas fa-phone-alt", bgColor: "bg-[#FF6B6B]/20", textColor: "text-[#FF6B6B]" };
      case "delay":
        return { icon: "fas fa-clock", bgColor: "bg-[#FFD166]/20", textColor: "text-[#FFD166]" };
      case "scrape":
        return { icon: "fas fa-spider", bgColor: "bg-[#6E56CF]/20", textColor: "text-[#6E56CF]" };
      case "score":
        return { icon: "fas fa-brain", bgColor: "bg-[#00F5D4]/20", textColor: "text-[#00F5D4]" };
      case "calculate":
        return { icon: "fas fa-calculator", bgColor: "bg-[#00F5D4]/20", textColor: "text-[#00F5D4]" };
      case "document":
        return { icon: "fas fa-file-alt", bgColor: "bg-[#06D6A0]/20", textColor: "text-[#06D6A0]" };
      default:
        return { icon: "fas fa-cog", bgColor: "bg-[#CCCED0]/20", textColor: "text-[#CCCED0]" };
    }
  });
  
  // Format last run date
  const lastRunText = workflow.lastRun 
    ? formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true }) 
    : "Never";
  
  return (
    <div className="bg-[#1A1A2E] border border-[#2A2A3A] hover:border-[#6E56CF]/50 rounded p-4 mb-4 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-[#F8F9FA]">{workflow.name}</h4>
          <p className="text-xs text-[#CCCED0] monospace-text mt-1">{workflow.description}</p>
        </div>
        <div className="flex">
          <span className="bg-[#00F5D4]/20 text-[#00F5D4] text-xs monospace-text mr-2 px-2.5 py-0.5 rounded border border-[#00F5D4]/30 flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00F5D4] mr-1"></span> ONLINE
          </span>
          <div className="text-[#CCCED0] hover:text-[#F8F9FA] cursor-pointer">
            <i className="fas fa-ellipsis-v"></i>
          </div>
        </div>
      </div>
      
      {/* Workflow Diagram */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center overflow-x-auto space-x-2">
          {workflowIcons.map((icon, index) => (
            <div key={index} className="flex items-center flex-nowrap">
              <div className={`rounded ${icon.bgColor} p-2 ${icon.textColor} flex-shrink-0 border border-[#2A2A3A]`}>
                <i className={`${icon.icon} text-sm`}></i>
              </div>
              {index < workflowIcons.length - 1 && (
                <div className="h-0.5 w-5 bg-[#2A2A3A]"></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs text-[#CCCED0] monospace-text whitespace-nowrap">
          Last: <span className="text-[#6E56CF]">{lastRunText}</span>
        </div>
      </div>
    </div>
  );
}
