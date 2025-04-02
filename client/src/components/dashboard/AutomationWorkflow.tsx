import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Workflow, WorkflowTemplate as WorkflowTemplateType } from "@/lib/types";
import WorkflowCard from "../automations/WorkflowCard";
import WorkflowTemplateComponent from "../automations/WorkflowTemplate";

export default function AutomationWorkflow() {
  // Fetch active workflows
  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });
  
  // Workflow templates
  const templates: WorkflowTemplateType[] = [
    {
      id: "lead-qualifier",
      name: "Target Qualifier",
      description: "Score and route new targets",
      icon: "fas fa-filter",
      iconBgColor: "bg-[#6E56CF]/20",
      iconColor: "text-[#6E56CF]"
    },
    {
      id: "outreach-sequence",
      name: "Outreach Sequence",
      description: "SMS, email, call sequence",
      icon: "fas fa-paper-plane",
      iconBgColor: "bg-[#FF6B6B]/20",
      iconColor: "text-[#FF6B6B]"
    },
    {
      id: "contract-generator",
      name: "Contract Generator",
      description: "Create purchase agreements",
      icon: "fas fa-file-signature",
      iconBgColor: "bg-[#00F5D4]/20",
      iconColor: "text-[#00F5D4]"
    },
    {
      id: "scraper-workflow",
      name: "Scraper Protocol",
      description: "Extract data from websites",
      icon: "fas fa-spider",
      iconBgColor: "bg-[#FFD166]/20",
      iconColor: "text-[#FFD166]"
    },
    {
      id: "custom-workflow",
      name: "Custom Protocol",
      description: "Create from scratch",
      icon: "fas fa-wrench",
      iconBgColor: "bg-[#06D6A0]/20",
      iconColor: "text-[#06D6A0]"
    }
  ];
  
  return (
    <div className="mb-8">
      <div className="mb-5 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#F8F9FA]">ACTIVE PROTOCOLS</h3>
        <Button className="bg-[#6E56CF] hover:bg-[#5D46BD] text-white">
          <span className="mr-2">+</span> Create Protocol
        </Button>
      </div>

      <div className="bg-[#20223A] p-5 rounded border border-[#2A2A3A]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Workflows */}
          <div className="col-span-2">
            <h3 className="text-base font-medium text-[#F8F9FA] mb-4 flex items-center">
              <span className="h-2 w-2 rounded-full bg-[#00F5D4] mr-2"></span>
              OPERATIONAL PROTOCOLS
            </h3>
            
            {isLoading ? (
              <div className="p-4 text-center text-[#CCCED0]">
                <div className="animate-pulse h-4 w-24 bg-[#2A2A3A] rounded mx-auto"></div>
              </div>
            ) : workflows?.length === 0 ? (
              <div className="p-4 text-center text-[#CCCED0] monospace-text">No active protocols found</div>
            ) : (
              workflows?.map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))
            )}
          </div>

          {/* Workflow Templates */}
          <div>
            <h3 className="text-base font-medium text-[#F8F9FA] mb-4 flex items-center">
              <span className="h-2 w-2 rounded-full bg-[#6E56CF] mr-2"></span>
              PROTOCOL TEMPLATES
            </h3>
            <div className="space-y-3">
              {templates.map(template => (
                <WorkflowTemplateComponent 
                  key={template.id}
                  template={template} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
