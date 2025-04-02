import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LeadCard from "../leads/LeadCard";

export default function LeadKanban() {
  const [selectedSource, setSelectedSource] = useState<string>("all");
  
  // Fetch leads grouped by status
  const { data: allLeads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
  
  const newLeads = allLeads?.filter(lead => lead.status === "new") || [];
  const contactedLeads = allLeads?.filter(lead => lead.status === "contacted") || [];
  const closedLeads = allLeads?.filter(lead => lead.status === "closed") || [];
  
  // Filter leads by source if selected
  const filteredNewLeads = selectedSource === "all" 
    ? newLeads 
    : newLeads.filter(lead => lead.source === selectedSource);
  
  const filteredContactedLeads = selectedSource === "all" 
    ? contactedLeads 
    : contactedLeads.filter(lead => lead.source === selectedSource);
  
  const filteredClosedLeads = selectedSource === "all" 
    ? closedLeads 
    : closedLeads.filter(lead => lead.source === selectedSource);
  
  // Update lead status mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });
  
  const handleUpdateLeadStatus = (leadId: number, newStatus: string) => {
    updateLeadMutation.mutate({ id: leadId, status: newStatus });
  };
  
  return (
    <div className="mb-8">
      <div className="mb-5 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#F8F9FA]">TARGET ACQUISITION PIPELINE</h3>
        <div className="flex space-x-2">
          <Select 
            value={selectedSource}
            onValueChange={setSelectedSource}
          >
            <SelectTrigger className="w-[180px] bg-[#20223A] border-[#2A2A3A] text-[#F8F9FA]">
              <SelectValue placeholder="All Target Sources" />
            </SelectTrigger>
            <SelectContent className="bg-[#20223A] border-[#2A2A3A] text-[#F8F9FA]">
              <SelectItem value="all">All Target Sources</SelectItem>
              <SelectItem value="tax_delinquent">Tax Delinquent</SelectItem>
              <SelectItem value="probate">Probate</SelectItem>
              <SelectItem value="fsbo">FSBO</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#6E56CF] hover:bg-[#5D46BD] text-white">
            <span className="mr-2">+</span> Add Target
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* New Leads Column */}
        <div>
          <div className="bg-[#20223A] p-4 rounded-t border-x border-t border-[#2A2A3A]">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#F8F9FA] flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#00F5D4] mr-2"></span>
                NEW TARGETS
              </h3>
              <span className="bg-[#6E56CF]/20 text-[#6E56CF] text-xs monospace-text px-2.5 py-0.5 rounded border border-[#6E56CF]/30">
                {filteredNewLeads.length}
              </span>
            </div>
          </div>
          <div className="bg-[#1A1A2E] p-2 h-auto min-h-[400px] max-h-[600px] overflow-y-auto rounded-b border-x border-b border-[#2A2A3A]">
            {isLoading ? (
              <div className="p-4 text-center text-[#CCCED0]">
                <div className="animate-pulse h-4 w-24 bg-[#20223A] rounded mx-auto"></div>
              </div>
            ) : filteredNewLeads.length === 0 ? (
              <div className="p-4 text-center text-[#CCCED0]">No new targets found</div>
            ) : (
              filteredNewLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* Contacted Column */}
        <div>
          <div className="bg-[#20223A] p-4 rounded-t border-x border-t border-[#2A2A3A]">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#F8F9FA] flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#6E56CF] mr-2"></span>
                ENGAGEMENT
              </h3>
              <span className="bg-[#6E56CF]/20 text-[#6E56CF] text-xs monospace-text px-2.5 py-0.5 rounded border border-[#6E56CF]/30">
                {filteredContactedLeads.length}
              </span>
            </div>
          </div>
          <div className="bg-[#1A1A2E] p-2 h-auto min-h-[400px] max-h-[600px] overflow-y-auto rounded-b border-x border-b border-[#2A2A3A]">
            {isLoading ? (
              <div className="p-4 text-center text-[#CCCED0]">
                <div className="animate-pulse h-4 w-24 bg-[#20223A] rounded mx-auto"></div>
              </div>
            ) : filteredContactedLeads.length === 0 ? (
              <div className="p-4 text-center text-[#CCCED0]">No engaged targets found</div>
            ) : (
              filteredContactedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                  showContactInfo
                />
              ))
            )}
          </div>
        </div>

        {/* Closed Column */}
        <div>
          <div className="bg-[#20223A] p-4 rounded-t border-x border-t border-[#2A2A3A]">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#F8F9FA] flex items-center">
                <span className="h-2 w-2 rounded-full bg-[#FF6B6B] mr-2"></span>
                ACQUIRED
              </h3>
              <span className="bg-[#6E56CF]/20 text-[#6E56CF] text-xs monospace-text px-2.5 py-0.5 rounded border border-[#6E56CF]/30">
                {filteredClosedLeads.length}
              </span>
            </div>
          </div>
          <div className="bg-[#1A1A2E] p-2 h-auto min-h-[400px] max-h-[600px] overflow-y-auto rounded-b border-x border-b border-[#2A2A3A]">
            {isLoading ? (
              <div className="p-4 text-center text-[#CCCED0]">
                <div className="animate-pulse h-4 w-24 bg-[#20223A] rounded mx-auto"></div>
              </div>
            ) : filteredClosedLeads.length === 0 ? (
              <div className="p-4 text-center text-[#CCCED0]">No acquired targets found</div>
            ) : (
              filteredClosedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                  showDealInfo
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
