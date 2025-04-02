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
      name: "Lead Qualifier",
      description: "Score and route new leads",
      icon: "fas fa-filter",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600"
    },
    {
      id: "outreach-sequence",
      name: "Outreach Sequence",
      description: "SMS, email, call sequence",
      icon: "fas fa-paper-plane",
      iconBgColor: "bg-secondary-100",
      iconColor: "text-secondary-600"
    },
    {
      id: "contract-generator",
      name: "Contract Generator",
      description: "Create purchase agreements",
      icon: "fas fa-file-signature",
      iconBgColor: "bg-accent-100",
      iconColor: "text-accent-600"
    },
    {
      id: "scraper-workflow",
      name: "Scraper Workflow",
      description: "Extract data from websites",
      icon: "fas fa-spider",
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      id: "custom-workflow",
      name: "Custom Workflow",
      description: "Create from scratch",
      icon: "fas fa-wrench",
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600"
    }
  ];
  
  return (
    <div className="mb-8">
      <div className="mb-5 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Automation Workflows</h2>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <i className="fas fa-plus mr-2"></i> Create Workflow
        </Button>
      </div>

      <div className="bg-white p-5 rounded-lg shadow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Workflows */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Workflows</h3>
            
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading workflows...</div>
            ) : workflows?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No active workflows found</div>
            ) : (
              workflows?.map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))
            )}
          </div>

          {/* Workflow Templates */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Templates</h3>
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
