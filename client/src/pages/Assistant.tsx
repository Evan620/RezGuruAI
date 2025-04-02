import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Assistant() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#F8F9FA] mb-2">TACTICAL AI ASSISTANT</h1>
        <p className="text-[#CCCED0]">Your personal real estate operations specialist, ready to assist with leads, documents, and automations.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-[700px]">
            <ChatInterface />
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Suggestions panel */}
          <div className="bg-[#20223A] rounded-lg border border-[#2A2A3A] p-4">
            <h3 className="text-sm font-semibold text-[#F8F9FA] mb-3 flex items-center">
              <span className="h-2 w-2 rounded-full bg-[#00F5D4] mr-2"></span>
              COMMAND SUGGESTIONS
            </h3>
            <div className="space-y-2">
              <div className="p-3 bg-[#1A1A2E] rounded border border-[#2A2A3A] text-[#F8F9FA] hover:border-[#6E56CF]/50 cursor-pointer transition-all">
                "Find high-value leads in [location]"
              </div>
              <div className="p-3 bg-[#1A1A2E] rounded border border-[#2A2A3A] text-[#F8F9FA] hover:border-[#6E56CF]/50 cursor-pointer transition-all">
                "Generate a purchase agreement for [property]"
              </div>
              <div className="p-3 bg-[#1A1A2E] rounded border border-[#2A2A3A] text-[#F8F9FA] hover:border-[#6E56CF]/50 cursor-pointer transition-all">
                "Set up tax delinquent scraping for [county]"
              </div>
              <div className="p-3 bg-[#1A1A2E] rounded border border-[#2A2A3A] text-[#F8F9FA] hover:border-[#6E56CF]/50 cursor-pointer transition-all">
                "Analyze my lead conversion rates"
              </div>
              <div className="p-3 bg-[#1A1A2E] rounded border border-[#2A2A3A] text-[#F8F9FA] hover:border-[#6E56CF]/50 cursor-pointer transition-all">
                "Find probate leads in [county]"
              </div>
            </div>
          </div>
          
          {/* Capabilities panel */}
          <div className="bg-[#20223A] rounded-lg border border-[#2A2A3A] p-4">
            <h3 className="text-sm font-semibold text-[#F8F9FA] mb-3 flex items-center">
              <span className="h-2 w-2 rounded-full bg-[#6E56CF] mr-2"></span>
              AI CAPABILITIES
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="h-8 w-8 rounded bg-[#6E56CF]/20 border border-[#6E56CF]/30 flex-shrink-0 flex items-center justify-center text-[#6E56CF] mr-3">
                  <i className="fas fa-search"></i>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#F8F9FA]">Lead Generation</h4>
                  <p className="text-xs text-[#CCCED0]">Find and analyze potential leads from multiple sources</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded bg-[#00F5D4]/20 border border-[#00F5D4]/30 flex-shrink-0 flex items-center justify-center text-[#00F5D4] mr-3">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#F8F9FA]">Document Creation</h4>
                  <p className="text-xs text-[#CCCED0]">Generate contracts, offers, and legal documents</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded bg-[#FF6B6B]/20 border border-[#FF6B6B]/30 flex-shrink-0 flex items-center justify-center text-[#FF6B6B] mr-3">
                  <i className="fas fa-comment-alt"></i>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#F8F9FA]">Outreach Automation</h4>
                  <p className="text-xs text-[#CCCED0]">Schedule and send SMS, emails, and follow-ups</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded bg-[#FFD166]/20 border border-[#FFD166]/30 flex-shrink-0 flex items-center justify-center text-[#FFD166] mr-3">
                  <i className="fas fa-brain"></i>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#F8F9FA]">Deal Analysis</h4>
                  <p className="text-xs text-[#CCCED0]">Evaluate properties and calculate potential ROI</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-8 w-8 rounded bg-[#6E56CF]/20 border border-[#6E56CF]/30 flex-shrink-0 flex items-center justify-center text-[#6E56CF] mr-3">
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#F8F9FA]">Workflow Automation</h4>
                  <p className="text-xs text-[#CCCED0]">Create and manage complex lead nurturing protocols</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}