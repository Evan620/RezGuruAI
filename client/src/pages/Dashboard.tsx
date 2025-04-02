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
    <div className="bg-[#101814] min-h-screen">
      {/* Dashboard Header - Military Style */}
      <div className="border-b border-[#1c2e22] bg-gradient-to-r from-[#101814] to-[#152317] p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#18251d] p-2 rounded-md border border-[#2a3c2f]">
              <Radar className="h-6 w-6 text-[#5a7d63]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#e0e7e3]">COMMAND CENTER</h1>
                <span className="text-xs bg-[#2a3c2f] text-[#7fb485] px-2 py-0.5 rounded uppercase font-mono">
                  SECURE
                </span>
              </div>
              <p className="mt-1 text-[#88a28e]">
                <span className="font-mono text-xs tracking-wider">CODENAME:</span> RezGuru Real Estate Operations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 bg-[#18251d] border-[#2a3c2f] hover:bg-[#1f2f25] text-[#a3c2a9]">
              <FileDown className="h-4 w-4" />
              Export Intel
            </Button>
            <Button className="gap-2 bg-[#304d36] hover:bg-[#385a3e] text-white border-[#2a3c2f]">
              <Target className="h-4 w-4" />
              New Target
            </Button>
          </div>
        </div>
        
        {/* Tactical Status Bar */}
        <div className="flex mt-4 text-xs border border-[#2a3c2f] rounded overflow-hidden divide-x divide-[#2a3c2f]">
          <div className="bg-[#18251d] px-3 py-1.5 text-[#8fb096] flex items-center">
            <Radio className="h-3 w-3 mr-1.5 text-[#7fb485]" />
            <span className="font-mono">MISSION STATUS: ACTIVE</span>
          </div>
          <div className="bg-[#18251d] px-3 py-1.5 text-[#8fb096] flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1.5 text-[#d3a95b]" />
            <span className="font-mono">ALERTS: 3</span>
          </div>
          <div className="bg-[#18251d] px-3 py-1.5 text-[#8fb096] flex items-center">
            <Crosshair className="h-3 w-3 mr-1.5 text-[#a8c1ad]" />
            <span className="font-mono">TARGETS: 248</span>
          </div>
          <div className="bg-[#18251d] px-3 py-1.5 text-[#8fb096] ml-auto flex items-center">
            <span className="font-mono">GRID REF: 37.7749° N, 122.4194° W</span>
          </div>
        </div>
      </div>
      
      <div className="px-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#18251d] border border-[#2a3c2f] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#304d36] data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              SITREP
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#304d36] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              INTELLIGENCE
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-[#304d36] data-[state=active]:text-white">
              <Map className="h-4 w-4 mr-2" />
              RECON
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-[#304d36] data-[state=active]:text-white">
              <Shield className="h-4 w-4 mr-2" />
              REPORTS
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="pt-6">
            {/* Metrics Overview */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#c1d6c6] flex items-center">
                  <Target className="h-5 w-5 mr-2 text-[#7fb485]" />
                  PRIMARY METRICS
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('metrics')}
                  className="text-[#8fb096] hover:text-[#c1d6c6] hover:bg-[#18251d]"
                >
                  {expandedSections.metrics ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                {expandedSections.metrics && <MetricsOverview />}
              </div>
            </div>
            
            {/* Analytics Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#c1d6c6] flex items-center">
                  <Radar className="h-5 w-5 mr-2 text-[#7fb485]" />
                  INTEL & REPORTING
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('analytics')}
                  className="text-[#8fb096] hover:text-[#c1d6c6] hover:bg-[#18251d]"
                >
                  {expandedSections.analytics ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                {expandedSections.analytics && <AnalyticsSection />}
              </div>
            </div>
            
            {/* Lead Kanban */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#c1d6c6] flex items-center">
                  <Crosshair className="h-5 w-5 mr-2 text-[#7fb485]" />
                  TARGET TRACKING
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('leads')}
                  className="text-[#8fb096] hover:text-[#c1d6c6] hover:bg-[#18251d]"
                >
                  {expandedSections.leads ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                {expandedSections.leads && <LeadKanban />}
              </div>
            </div>
            
            {/* Automation Workflow */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#c1d6c6] flex items-center">
                  <Radio className="h-5 w-5 mr-2 text-[#7fb485]" />
                  ACTIVE PROTOCOLS
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('automation')}
                  className="text-[#8fb096] hover:text-[#c1d6c6] hover:bg-[#18251d]"
                >
                  {expandedSections.automation ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                {expandedSections.automation && <AutomationWorkflow />}
              </div>
            </div>
            
            {/* Document Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#c1d6c6] flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#7fb485]" />
                  SECURE DOCUMENTS
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleSection('documents')}
                  className="text-[#8fb096] hover:text-[#c1d6c6] hover:bg-[#18251d]"
                >
                  {expandedSections.documents ? 'COLLAPSE' : 'EXPAND'}
                </Button>
              </div>
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                {expandedSections.documents && <DocumentSection />}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="pt-6">
            {/* Advanced Analytics Section */}
            <div className="mb-6">
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                <AdvancedAnalyticsSection />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="properties" className="pt-6">
            {/* Property Insights Section */}
            <div className="mb-6">
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                <PropertyInsightsSection />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reports" className="pt-6">
            {/* Report Generator */}
            <div className="mb-6">
              <div className="border border-[#2a3c2f] rounded-md bg-[#131f18] p-4">
                <ReportGenerator />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Footer - Military Style */}
      <div className="border-t border-[#1c2e22] bg-[#101814] mt-6 py-2 px-4">
        <div className="flex justify-between items-center text-xs text-[#5d7862] font-mono">
          <div>CLASSIFICATION: INTERNAL USE ONLY</div>
          <div>REZGURU AI COMMAND SYSTEM v2.0.3</div>
          <div>SESSION ID: 2425-ALPHA-78452</div>
        </div>
      </div>
    </div>
  );
}
