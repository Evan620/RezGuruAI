import MetricsOverview from "@/components/dashboard/MetricsOverview";
import LeadKanban from "@/components/dashboard/LeadKanban";
import AutomationWorkflow from "@/components/dashboard/AutomationWorkflow";
import DocumentSection from "@/components/dashboard/DocumentSection";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FileDown } from "lucide-react";

export default function Dashboard() {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    metrics: true,
    analytics: true, 
    leads: true,
    automation: true,
    documents: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div>
      {/* Dashboard Overview */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome to your real estate automation platform.</p>
        </div>
        <div>
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>
      
      {/* Metrics Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Key Metrics</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleSection('metrics')}
          >
            {expandedSections.metrics ? 'Hide' : 'Show'}
          </Button>
        </div>
        {expandedSections.metrics && <MetricsOverview />}
      </div>
      
      {/* Analytics Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Analytics & Reporting</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleSection('analytics')}
          >
            {expandedSections.analytics ? 'Hide' : 'Show'}
          </Button>
        </div>
        {expandedSections.analytics && <AnalyticsSection />}
      </div>
      
      {/* Lead Kanban */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Lead Pipeline</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleSection('leads')}
          >
            {expandedSections.leads ? 'Hide' : 'Show'}
          </Button>
        </div>
        {expandedSections.leads && <LeadKanban />}
      </div>
      
      {/* Automation Workflow */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Active Automations</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleSection('automation')}
          >
            {expandedSections.automation ? 'Hide' : 'Show'}
          </Button>
        </div>
        {expandedSections.automation && <AutomationWorkflow />}
      </div>
      
      {/* Document Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Recent Documents</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => toggleSection('documents')}
          >
            {expandedSections.documents ? 'Hide' : 'Show'}
          </Button>
        </div>
        {expandedSections.documents && <DocumentSection />}
      </div>
    </div>
  );
}
