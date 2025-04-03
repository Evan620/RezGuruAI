import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { WorkflowTemplate as WorkflowTemplateType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface WorkflowTemplateProps {
  template: WorkflowTemplateType;
}

export default function WorkflowTemplateComponent({ template }: WorkflowTemplateProps) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Create workflow from template mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      // Create basic workflow from template
      const workflowData = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        description: template.description,
        trigger: template.id,
        active: true,
        actions: getDefaultActions(template.id)
      };
      
      const response = await apiRequest("POST", "/api/workflows", workflowData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      setIsCreating(false);
      toast({
        title: "Workflow created!",
        description: `${template.name} workflow was created successfully.`,
      });
    },
    onError: (error) => {
      setIsCreating(false);
      toast({
        title: "Error",
        description: `Failed to create workflow: ${error}`,
        variant: "destructive",
      });
    }
  });
  
  // Get default actions based on template type
  const getDefaultActions = (templateId: string) => {
    switch (templateId) {
      case "lead-qualifier":
        return [
          { type: "score", name: "Score Lead", config: { threshold: 7 } },
          { type: "filter", name: "Filter High Value", config: { condition: "score > 7" } },
          { type: "notify", name: "Notify Team", config: { method: "email" } }
        ];
      case "outreach-sequence":
        return [
          { type: "sms", name: "Initial Text", config: { template: "intro" } },
          { type: "delay", name: "Wait 2 Days", config: { hours: 48 } },
          { type: "email", name: "Follow Up Email", config: { template: "follow-up" } },
          { type: "delay", name: "Wait 3 Days", config: { hours: 72 } },
          { type: "call", name: "Phone Call", config: { script: "default" } }
        ];
      case "contract-generator":
        return [
          { type: "document", name: "Generate Contract", config: { template: "purchase-agreement" } },
          { type: "email", name: "Send Contract", config: { template: "contract-delivery" } },
          { type: "notify", name: "Notify Agent", config: { method: "app" } }
        ];
      case "scraper-workflow":
        return [
          { type: "scrape", name: "Extract Data", config: { source: "tax_delinquent" } },
          { type: "filter", name: "Filter Results", config: { condition: "amount > 5000" } },
          { type: "create", name: "Create Leads", config: { status: "new" } }
        ];
      default:
        return [];
    }
  };
  
  const handleClick = () => {
    setIsCreating(true);
    createWorkflowMutation.mutate();
  };
  
  return (
    <div 
      className="bg-[#1A1A2E] hover:bg-[#20223A] border border-[#2A2A3A] hover:border-[#6E56CF]/50 rounded p-3 cursor-pointer transition-all"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className={`rounded ${template.iconBgColor} p-2 ${template.iconColor} flex-shrink-0 mr-3 border border-[#2A2A3A]`}>
          <i className={template.icon}></i>
        </div>
        <div className="flex-grow">
          <h5 className="font-medium text-[#F8F9FA]">{template.name}</h5>
          <p className="text-xs text-[#CCCED0] monospace-text">{template.description}</p>
        </div>
        {isCreating && (
          <div className="flex-shrink-0 w-4 h-4 border-2 border-t-transparent border-[#6E56CF] rounded-full animate-spin"></div>
        )}
      </div>
    </div>
  );
}
