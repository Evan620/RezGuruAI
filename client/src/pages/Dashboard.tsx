import MetricsOverview from "@/components/dashboard/MetricsOverview";
import LeadKanban from "@/components/dashboard/LeadKanban";
import AutomationWorkflow from "@/components/dashboard/AutomationWorkflow";
import DocumentSection from "@/components/dashboard/DocumentSection";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import AdvancedAnalyticsSection from "@/components/dashboard/AdvancedAnalyticsSection";
import ReportGenerator from "@/components/dashboard/ReportGenerator";
import PropertyInsightsSection from "@/components/dashboard/PropertyInsightsSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsLink, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BarChart3, FileDown, Home, Plus } from "lucide-react";

export default function Dashboard() {
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    metrics: true,
    analytics: true, 
    advancedAnalytics: false,
    reports: false,
    propertyInsights: false,
    leads: true,
    automation: true,
    documents: true
  });

  const [activeTab, setActiveTab] = useState<string>("overview");

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div>
      {/* Dashboard Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Welcome to your real estate automation platform.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Reports
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Lead
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-6">
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
        </TabsContent>
        
        <TabsContent value="analytics" className="pt-6">
          {/* Advanced Analytics Section */}
          <div className="mb-6">
            <AdvancedAnalyticsSection />
          </div>
        </TabsContent>
        
        <TabsContent value="properties" className="pt-6">
          {/* Property Insights Section */}
          <div className="mb-6">
            <PropertyInsightsSection />
          </div>
        </TabsContent>
        
        <TabsContent value="reports" className="pt-6">
          {/* Report Generator */}
          <div className="mb-6">
            <ReportGenerator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
