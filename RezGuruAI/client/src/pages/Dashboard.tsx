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
                <h1 className="text-2xl font-bold text-[#F8F9FA]">INSIGHT HUB</h1>
                <span className="status-badge-active">
                  ACTIVE
                </span>
              </div>
              <p className="mt-1 text-[#CCCED0]">
                <span className="monospace-text">PLATFORM:</span> RezGuru Real Estate Operations
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              className="gap-2 tactical-button-secondary"
              onClick={() => {
                // Generate richer sample data for export
                const headers = ["Category", "Metric", "Value", "Change", "Period"];
                
                const metricsData = [
                  ["Leads", "Total Leads", "248", "+12%", "YTD"],
                  ["Leads", "New Leads (This Month)", "37", "+8%", "MoM"],
                  ["Leads", "Conversion Rate", "8.2%", "+1.5%", "YTD"],
                  ["Deals", "Average Deal Size", "$158,000", "+5.3%", "YTD"],
                  ["Deals", "Biggest Deal", "$425,000", "", "YTD"],
                  ["Deals", "Close Rate", "22%", "+3%", "QoQ"],
                  ["Revenue", "Total Revenue", "$2.4M", "+18%", "YTD"],
                  ["Revenue", "Revenue Target", "$3.5M", "", "2025"],
                  ["Performance", "ROI", "342%", "+28%", "YTD"],
                  ["Performance", "Lead Response Time", "1.2 hours", "-15%", "QoQ"],
                  ["Properties", "Properties Under Contract", "14", "+3", "MoM"],
                  ["Properties", "Average Days on Market", "68", "-12", "QoQ"]
                ];
                
                // Create CSV content
                const csvContent = [
                  headers.join(','),
                  ...metricsData.map(row => row.join(','))
                ].join('\n');
                
                // Create download link
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `rezguru-analytics-${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Show success message
                alert('Analytics data exported successfully!');
              }}
            >
              <FileDown className="h-4 w-4" />
              Export Data
            </Button>
            <Button 
              className="gap-2 tactical-button"
              onClick={() => {
                // Create a dialog for new lead creation 
                const dialog = document.createElement('dialog');
                dialog.id = 'newLeadDialog';
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
                    <span>Create New Lead</span>
                    <button id="closeDialog" style="background: none; border: none; cursor: pointer; color: #CCCED0;">&times;</button>
                  </h2>
                  <form id="newLeadForm">
                    <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 8px; font-size: 14px;">Name</label>
                      <input id="leadName" type="text" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;" placeholder="Full Name" required />
                    </div>
                    <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 8px; font-size: 14px;">Phone</label>
                      <input id="leadPhone" type="text" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;" placeholder="+1 555-123-4567" />
                    </div>
                    <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 8px; font-size: 14px;">Email</label>
                      <input id="leadEmail" type="email" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;" placeholder="email@example.com" />
                    </div>
                    <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 8px; font-size: 14px;">Source</label>
                      <select id="leadSource" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;">
                        <option value="referral">Referral</option>
                        <option value="cold_call">Cold Call</option>
                        <option value="website">Website</option>
                        <option value="social_media">Social Media</option>
                        <option value="direct_mail">Direct Mail</option>
                        <option value="scraping">Data Scraping</option>
                      </select>
                    </div>
                    <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 8px; font-size: 14px;">Property Address</label>
                      <input id="leadAddress" type="text" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA;" placeholder="123 Main St, Anytown, ST 12345" />
                    </div>
                    <div style="margin-bottom: 16px;">
                      <label style="display: block; margin-bottom: 8px; font-size: 14px;">Notes</label>
                      <textarea id="leadNotes" style="width: 100%; padding: 8px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #F8F9FA; min-height: 80px;" placeholder="Additional notes about this lead..."></textarea>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
                      <button type="button" id="cancelButton" style="padding: 8px 16px; background: #20223A; border: 1px solid #2A2A3A; border-radius: 4px; color: #CCCED0; cursor: pointer;">Cancel</button>
                      <button type="submit" style="padding: 8px 16px; background: #6E56CF; border: none; border-radius: 4px; color: white; cursor: pointer;">Create Lead</button>
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
                document.getElementById('newLeadForm')?.addEventListener('submit', async (e) => {
                  e.preventDefault();
                  
                  const name = (document.getElementById('leadName') as HTMLInputElement).value;
                  const phone = (document.getElementById('leadPhone') as HTMLInputElement).value;
                  const email = (document.getElementById('leadEmail') as HTMLInputElement).value;
                  const source = (document.getElementById('leadSource') as HTMLSelectElement).value;
                  const propertyAddress = (document.getElementById('leadAddress') as HTMLInputElement).value;
                  const notes = (document.getElementById('leadNotes') as HTMLTextAreaElement).value;
                  
                  try {
                    const response = await fetch('/api/leads', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name,
                        phone,
                        email,
                        source,
                        propertyAddress,
                        notes,
                        status: 'new'
                      }),
                    });
                    
                    if (response.ok) {
                      // Close the dialog
                      dialog.close();
                      document.body.removeChild(dialog);
                      
                      // Show success message
                      alert('Lead created successfully!');
                      
                      // Refresh the page to show the new lead
                      window.location.reload();
                    } else {
                      console.error('Failed to create lead:', await response.text());
                      alert('Failed to create lead. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error creating lead:', error);
                    alert('An error occurred while creating the lead.');
                  }
                });
              }}
            >
              <Target className="h-4 w-4" />
              New Lead
            </Button>
          </div>
        </div>
        
        {/* Status Bar */}
        <div className="flex mt-4 text-xs border border-[#2A2A3A] rounded overflow-hidden divide-x divide-[#2A2A3A]">
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] flex items-center">
            <Radio className="h-3 w-3 mr-1.5 text-[#00F5D4]" />
            <span className="monospace-text">SYSTEM STATUS: ONLINE</span>
          </div>
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1.5 text-[#FF6B6B]" />
            <span className="monospace-text">NOTIFICATIONS: 3</span>
          </div>
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] flex items-center">
            <Crosshair className="h-3 w-3 mr-1.5 text-[#6E56CF]" />
            <span className="monospace-text">ACTIVE LEADS: 248</span>
          </div>
          <div className="bg-[#20223A] px-3 py-1.5 text-[#CCCED0] ml-auto flex items-center">
            <span className="monospace-text">LOCATION: SAN FRANCISCO, CA</span>
          </div>
        </div>
      </div>
      
      <div className="px-4">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-[#20223A] border border-[#2A2A3A] p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2" />
              DASHBOARD
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              ANALYTICS
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white">
              <Map className="h-4 w-4 mr-2" />
              PROPERTIES
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
                  INSIGHTS & REPORTING
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
                  LEAD PIPELINE
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
                  ACTIVE WORKFLOWS
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
                  TRANSACTION DOCUMENTS
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
          <div>ACCESS LEVEL: PREMIUM</div>
          <div>REZGURU AI PLATFORM v2.1.0</div>
          <div>USER ID: <span className="highlight-text">RG-7845-2425</span></div>
        </div>
      </div>
    </div>
  );
}
