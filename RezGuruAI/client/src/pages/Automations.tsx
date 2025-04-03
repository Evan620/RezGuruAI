import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Workflow, WorkflowTemplate as WorkflowTemplateType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkflowCard from "@/components/automations/WorkflowCard";
import WorkflowTemplateComponent from "@/components/automations/WorkflowTemplate";

export default function Automations() {
  // Fetch all workflows
  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
  });
  
  // Filter active and inactive workflows
  const activeWorkflows = workflows?.filter(wf => wf.active) || [];
  const inactiveWorkflows = workflows?.filter(wf => !wf.active) || [];
  
  // Toggle workflow active status
  const updateWorkflowMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number, active: boolean }) => {
      const response = await apiRequest("PATCH", `/api/workflows/${id}`, { active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
    },
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation Workflows</h1>
          <p className="mt-1 text-gray-500">Create and manage automated lead processes</p>
        </div>
        <Button 
          className="bg-primary-600 hover:bg-primary-700"
          onClick={() => {
            // Create a dialog for new workflow creation
            const dialog = document.createElement('dialog');
            dialog.id = 'newWorkflowDialog';
            dialog.style.position = 'fixed';
            dialog.style.top = '50%';
            dialog.style.left = '50%';
            dialog.style.transform = 'translate(-50%, -50%)';
            dialog.style.padding = '20px';
            dialog.style.background = '#1A1A2E';
            dialog.style.border = '1px solid #2A2A3A';
            dialog.style.borderRadius = '8px';
            dialog.style.zIndex = '1000';
            dialog.style.minWidth = '400px';
            dialog.style.maxWidth = '600px';
            dialog.style.color = '#F8F9FA';
            
            // Add dialog content
            dialog.innerHTML = `
              <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                <span>Create New Workflow</span>
                <button id="closeDialog" style="background: none; border: none; cursor: pointer; color: #CCCED0;">&times;</button>
              </h2>
              <form id="newWorkflowForm">
                <div style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 8px; font-size: 14px;">Name</label>
                  <input id="workflowName" type="text" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;" placeholder="Workflow Name" required />
                </div>
                <div style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 8px; font-size: 14px;">Description</label>
                  <input id="workflowDescription" type="text" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;" placeholder="Workflow Description" />
                </div>
                <div style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 8px; font-size: 14px;">Type</label>
                  <select id="workflowType" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;">
                    <option value="lead-qualifier">Lead Qualifier</option>
                    <option value="outreach-sequence">Outreach Sequence</option>
                    <option value="contract-generator">Contract Generator</option>
                    <option value="scraper-workflow">Scraper Workflow</option>
                    <option value="custom-workflow">Custom Workflow</option>
                  </select>
                </div>
                <div style="margin-bottom: 16px;">
                  <label style="display: block; margin-bottom: 8px; font-size: 14px;">Status</label>
                  <div style="display: flex; align-items: center;">
                    <input id="workflowActive" type="checkbox" checked style="margin-right: 8px; accent-color: #6E56CF;" />
                    <label for="workflowActive" style="font-size: 14px;">Active</label>
                  </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
                  <button type="button" id="cancelButton" style="padding: 8px 16px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #CCCED0; cursor: pointer;">Cancel</button>
                  <button type="submit" style="padding: 8px 16px; background: #6E56CF; border: none; border-radius: 4px; color: white; cursor: pointer;">Create Workflow</button>
                </div>
              </form>
            `;
            
            document.body.appendChild(dialog);
            dialog.showModal();
            
            // Close dialog handlers
            document.getElementById('closeDialog')?.addEventListener('click', () => {
              dialog.close();
              document.body.removeChild(dialog);
            });
            
            document.getElementById('cancelButton')?.addEventListener('click', () => {
              dialog.close();
              document.body.removeChild(dialog);
            });
            
            // Form submission
            document.getElementById('newWorkflowForm')?.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const name = (document.getElementById('workflowName') as HTMLInputElement).value;
              const description = (document.getElementById('workflowDescription') as HTMLInputElement).value;
              const type = (document.getElementById('workflowType') as HTMLSelectElement).value;
              const active = (document.getElementById('workflowActive') as HTMLInputElement).checked;
              
              try {
                const response = await fetch('/api/workflows', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name,
                    description,
                    type,
                    active,
                    config: {
                      actionSequence: [],
                      conditions: [],
                      triggers: []
                    }
                  }),
                });
                
                if (response.ok) {
                  // Close the dialog
                  dialog.close();
                  document.body.removeChild(dialog);
                  
                  // Show success message
                  alert('Workflow created successfully!');
                  
                  // Refresh the page to show the new workflow
                  window.location.reload();
                } else {
                  console.error('Failed to create workflow:', await response.text());
                  alert('Failed to create workflow. Please try again.');
                }
              } catch (error) {
                console.error('Error creating workflow:', error);
                alert('An error occurred while creating the workflow.');
              }
            });
          }}
        >
          <i className="fas fa-plus mr-2"></i> Create Workflow
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="active">Active ({activeWorkflows.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactiveWorkflows.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    Loading workflows...
                  </CardContent>
                </Card>
              ) : activeWorkflows.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No active workflows found
                  </CardContent>
                </Card>
              ) : (
                activeWorkflows.map(workflow => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))
              )}
            </TabsContent>
            
            <TabsContent value="inactive">
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    Loading workflows...
                  </CardContent>
                </Card>
              ) : inactiveWorkflows.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    No inactive workflows found
                  </CardContent>
                </Card>
              ) : (
                inactiveWorkflows.map(workflow => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Templates */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>Start with a pre-built automation workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templates.map(template => (
                  <WorkflowTemplateComponent
                    key={template.id}
                    template={template}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Automation Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1 mr-2"></i>
                  <span>Create a delay of 24-48 hours between follow-up messages</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1 mr-2"></i>
                  <span>Use AI scoring to prioritize high-motivation leads</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1 mr-2"></i>
                  <span>Personalize messages with lead details for higher response rates</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-500 mt-1 mr-2"></i>
                  <span>Set up document generators to create offers automatically</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
