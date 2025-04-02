import MetricsOverview from "@/components/dashboard/MetricsOverview";
import LeadKanban from "@/components/dashboard/LeadKanban";
import AutomationWorkflow from "@/components/dashboard/AutomationWorkflow";
import DocumentSection from "@/components/dashboard/DocumentSection";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import AdvancedAnalyticsSection from "@/components/dashboard/AdvancedAnalyticsSection";
import ReportGenerator from "@/components/dashboard/ReportGenerator";
import PropertyInsightsSection from "@/components/dashboard/PropertyInsightsSection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { 
  BarChart3, FileDown, Plus, Target, Shield, Radio, 
  Radar, Map, Flag, AlertTriangle, Crosshair, Zap
} from "lucide-react";

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
    <div className="min-h-screen">
      {/* Dashboard Header */}
      <div className="border-b border-[#2A2A3A] p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#6E56CF]/20 p-2 rounded border border-[#6E56CF]/30">
              <Radar className="h-6 w-6 text-[#6E56CF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#F8F9FA]">COMMAND CENTER</h1>
                <span className="status-badge-active">
                  SECURE
                </span>
              </div>
              <p className="mt-1 text-[#CCCED0]">
                <span className="monospace-text">CODENAME:</span> RezGuru Real Estate Operations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 tactical-button-secondary">
              <FileDown className="h-4 w-4" />
              Export Intel
            </Button>
            <Button className="gap-2 tactical-button">
              <Target className="h-4 w-4" />
              New Target
            </Button>
          </div>
        </div>
        
        {/* Tactical Status Bar */}
        <div className="flex mt-4 text-xs border border-[#2A2A3A] rounded overflow-hidden divide-x divide-[#2A2A3A]">
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] flex items-center">
            <Radio className="h-3 w-3 mr-1.5 text-[#00F5D4]" />
            <span className="monospace-text">MISSION STATUS: ACTIVE</span>
          </div>
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1.5 text-[#FF6B6B]" />
            <span className="monospace-text">ALERTS: 3</span>
          </div>
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] flex items-center">
            <Crosshair className="h-3 w-3 mr-1.5 text-[#6E56CF]" />
            <span className="monospace-text">TARGETS: 248</span>
          </div>
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] ml-auto flex items-center">
            <span className="monospace-text">GRID REF: 37.7749° N, 122.4194° W</span>
          </div>
        </div>
      </div>
      
      <div className="px-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#20223A] border border-[#2A2A3A] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              SITREP
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              INTELLIGENCE
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <Map className="h-4 w-4 mr-2" />
              RECON
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              REPORTS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-6">
            {/* Metrics Overview */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#F8F9FA] flex items-center">
                  <Target className="h-5 w-5 mr-2 text-[#6E56CF]" />
                  PRIMARY METRICS
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('metrics')}
                  className="text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#20223A]"
                >
                  {expandedSections.metrics ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="card-base p-4">
                {expandedSections.metrics && <MetricsOverview />}
              </div>
            </div>
            
            {/* Analytics Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#F8F9FA] flex items-center">
                  <Radar className="h-5 w-5 mr-2 text-[#6E56CF]" />
                  INTEL & REPORTING
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('analytics')}
                  className="text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#20223A]"
                >
                  {expandedSections.analytics ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="card-base p-4">
                {expandedSections.analytics && <AnalyticsSection />}
              </div>
            </div>
            
            {/* Lead Kanban */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#F8F9FA] flex items-center">
                  <Crosshair className="h-5 w-5 mr-2 text-[#6E56CF]" />
                  TARGET TRACKING
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('leads')}
                  className="text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#20223A]"
                >
                  {expandedSections.leads ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="card-base p-4">
                {expandedSections.leads && <LeadKanban />}
              </div>
            </div>
            
            {/* Automation Workflow */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#F8F9FA] flex items-center">
                  <Radio className="h-5 w-5 mr-2 text-[#6E56CF]" />
                  ACTIVE PROTOCOLS
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('automation')}
                  className="text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#20223A]"
                >
                  {expandedSections.automation ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="card-base p-4">
                {expandedSections.automation && <AutomationWorkflow />}
              </div>
            </div>
            
            {/* Document Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#F8F9FA] flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#6E56CF]" />
                  SECURE DOCUMENTS
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('documents')}
                  className="text-[#CCCED0] hover:text-[#F8F9FA] hover:bg-[#20223A]"
                >
                  {expandedSections.documents ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="card-base p-4">
                {expandedSections.documents && <DocumentSection />}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="pt-6">
            {/* Advanced Analytics Section */}
            <div className="mb-6">
              <div className="card-base p-4">
                <AdvancedAnalyticsSection />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="pt-6">
            {/* Property Insights Section */}
            <div className="mb-6">
              <div className="card-base p-4">
                <PropertyInsightsSection />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="pt-6">
            {/* Report Generator */}
            <div className="mb-6">
              <div className="card-base p-4">
                <ReportGenerator />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer */}
      <div className="border-t border-[#2A2A3A] mt-6 py-2 px-4">
        <div className="flex justify-between items-center text-xs text-[#CCCED0] monospace-text">
          <div>CLASSIFICATION: INTERNAL USE ONLY</div>
          <div>REZGURU AI COMMAND SYSTEM v2.1.0</div>
          <div>SESSION ID: <span className="highlight-text">2425-ALPHA-78452</span></div>
        </div>
      </div>
    </div>
  );
}
