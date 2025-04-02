import MetricsOverview from "@/components/dashboard/MetricsOverview";
import LeadKanban from "@/components/dashboard/LeadKanban";
import AutomationWorkflow from "@/components/dashboard/AutomationWorkflow";
import DocumentSection from "@/components/dashboard/DocumentSection";

export default function Dashboard() {
  return (
    <div>
      {/* Dashboard Overview */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome to your real estate automation platform.</p>
      </div>
      
      {/* Metrics Overview */}
      <MetricsOverview />
      
      {/* Lead Kanban */}
      <LeadKanban />
      
      {/* Automation Workflow */}
      <AutomationWorkflow />
      
      {/* Document Section */}
      <DocumentSection />
    </div>
  );
}
