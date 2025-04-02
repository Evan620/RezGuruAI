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
        return { icon: "fas fa-filter", bgColor: "bg-blue-100", textColor: "text-blue-600" };
      case "sms":
        return { icon: "fas fa-sms", bgColor: "bg-indigo-100", textColor: "text-indigo-600" };
      case "email":
        return { icon: "fas fa-envelope", bgColor: "bg-indigo-100", textColor: "text-indigo-600" };
      case "call":
        return { icon: "fas fa-phone-alt", bgColor: "bg-red-100", textColor: "text-red-600" };
      case "delay":
        return { icon: "fas fa-clock", bgColor: "bg-yellow-100", textColor: "text-yellow-600" };
      case "scrape":
        return { icon: "fas fa-spider", bgColor: "bg-blue-100", textColor: "text-blue-600" };
      case "score":
        return { icon: "fas fa-brain", bgColor: "bg-purple-100", textColor: "text-purple-600" };
      case "calculate":
        return { icon: "fas fa-calculator", bgColor: "bg-purple-100", textColor: "text-purple-600" };
      case "document":
        return { icon: "fas fa-file-alt", bgColor: "bg-indigo-100", textColor: "text-indigo-600" };
      default:
        return { icon: "fas fa-cog", bgColor: "bg-gray-100", textColor: "text-gray-600" };
    }
  });
  
  // Format last run date
  const lastRunText = workflow.lastRun 
    ? formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true }) 
    : "Never";
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{workflow.name}</h4>
          <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
        </div>
        <div className="flex">
          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded flex items-center">
            <i className="fas fa-play text-xs mr-1"></i> Active
          </span>
          <div className="text-gray-400 hover:text-gray-500 cursor-pointer">
            <i className="fas fa-ellipsis-v"></i>
          </div>
        </div>
      </div>
      
      {/* Workflow Diagram */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center overflow-x-auto">
          {workflowIcons.map((icon, index) => (
            <div key={index} className="flex items-center flex-nowrap">
              <div className={`rounded-full ${icon.bgColor} p-2 ${icon.textColor} flex-shrink-0`}>
                <i className={`${icon.icon} text-sm`}></i>
              </div>
              {index < workflowIcons.length - 1 && (
                <div className="h-0.5 w-8 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500 whitespace-nowrap">
          Last run: {lastRunText}
        </div>
      </div>
    </div>
  );
}
