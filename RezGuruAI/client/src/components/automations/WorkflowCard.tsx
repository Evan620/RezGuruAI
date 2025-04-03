import { Workflow } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface WorkflowCardProps {
  workflow: Workflow;
}

interface WorkflowResult {
  success: boolean;
  message: string;
  workflow: Workflow;
  details?: string;
  results?: {
    processed: number;
    actions: Array<{
      type: string;
      status: string;
      details: string;
    }>;
    [key: string]: any;
  };
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  // State for execution results and error message
  const [showResults, setShowResults] = useState(false);
  const [executionResults, setExecutionResults] = useState<WorkflowResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Run workflow mutation
  const runWorkflowMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/workflows/${workflow.id}/run`, {});
      return response.json();
    },
    onSuccess: (data: WorkflowResult) => {
      // Store execution results
      setExecutionResults(data);
      setShowResults(true);
      
      // Invalidate the workflows query to fetch updated data
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
    onError: (error: any) => {
      setErrorMessage(error?.message || "Failed to run workflow");
    },
  });

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
  
  // Handle run button click
  const handleRunClick = () => {
    runWorkflowMutation.mutate();
  };
  
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
      
      {/* Run Button and Status */}
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={handleRunClick}
          disabled={runWorkflowMutation.isPending}
          className="bg-[#6E56CF] hover:bg-[#5A46B0] text-white text-xs py-1.5 px-3 rounded-md flex items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {runWorkflowMutation.isPending ? (
            <>
              <i className="fas fa-spinner fa-spin mr-1.5"></i>
              Running...
            </>
          ) : (
            <>
              <i className="fas fa-play mr-1.5"></i>
              Run Workflow
            </>
          )}
        </button>
        
        {runWorkflowMutation.isSuccess && !showResults && (
          <div className="text-xs text-green-500 flex items-center cursor-pointer" onClick={() => setShowResults(true)}>
            <i className="fas fa-check-circle mr-1"></i>
            Workflow executed successfully 
            <i className="fas fa-chevron-down ml-1.5"></i>
          </div>
        )}
        
        {runWorkflowMutation.isError && (
          <div className="text-xs text-red-500">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errorMessage || "Error running workflow"}
          </div>
        )}
      </div>
      
      {/* Execution Results */}
      {showResults && executionResults && (
        <div className="mt-4 border border-[#2A2A3A] rounded bg-[#0F0F1A] p-3">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-sm font-medium text-[#F8F9FA]">Execution Results</h5>
            <button 
              onClick={() => setShowResults(false)} 
              className="text-[#CCCED0] hover:text-[#F8F9FA] text-xs"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {executionResults.success === false ? (
            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-xs text-[#F8F9FA]">
              <p><i className="fas fa-exclamation-triangle text-red-500 mr-1.5"></i> {executionResults.message}</p>
              {executionResults.details && <p className="mt-1 text-[#CCCED0]">{executionResults.details}</p>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#1A1A2E] border border-[#2A2A3A] p-2 rounded">
                  <span className="text-xs text-[#CCCED0]">Actions Processed</span>
                  <div className="text-[#6E56CF] text-sm font-medium">{executionResults.results?.processed || 0}</div>
                </div>
                
                {executionResults.results?.filteredLeads !== undefined && (
                  <div className="bg-[#1A1A2E] border border-[#2A2A3A] p-2 rounded">
                    <span className="text-xs text-[#CCCED0]">Leads Filtered</span>
                    <div className="text-[#FF6B6B] text-sm font-medium">{executionResults.results.filteredLeads}</div>
                  </div>
                )}
                
                {executionResults.results?.documentsGenerated !== undefined && (
                  <div className="bg-[#1A1A2E] border border-[#2A2A3A] p-2 rounded">
                    <span className="text-xs text-[#CCCED0]">Documents Generated</span>
                    <div className="text-[#06D6A0] text-sm font-medium">{executionResults.results.documentsGenerated}</div>
                  </div>
                )}
                
                {executionResults.results?.leadsScored !== undefined && (
                  <div className="bg-[#1A1A2E] border border-[#2A2A3A] p-2 rounded">
                    <span className="text-xs text-[#CCCED0]">Leads Scored</span>
                    <div className="text-[#00F5D4] text-sm font-medium">{executionResults.results.leadsScored}</div>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-[#CCCED0] font-medium mb-1.5">Action Details</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto text-xs">
                {executionResults.results?.actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className={`
                      rounded-full w-4 h-4 flex-shrink-0 flex items-center justify-center mt-0.5
                      ${action.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                        action.status === 'error' ? 'bg-red-500/20 text-red-500' : 
                        'bg-yellow-500/20 text-yellow-500'}
                    `}>
                      {action.status === 'completed' ? (
                        <i className="fas fa-check text-[8px]"></i>
                      ) : action.status === 'error' ? (
                        <i className="fas fa-times text-[8px]"></i>
                      ) : (
                        <i className="fas fa-exclamation text-[8px]"></i>
                      )}
                    </div>
                    <div>
                      <div className="text-[#F8F9FA] font-medium capitalize">{action.type}</div>
                      <div className="text-[#CCCED0] text-[10px]">{action.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
