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
        <h2 className="text-xl font-bold text-gray-900">Lead Pipeline</h2>
        <div className="flex space-x-2">
          <Select 
            value={selectedSource}
            onValueChange={setSelectedSource}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Lead Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lead Sources</SelectItem>
              <SelectItem value="tax_delinquent">Tax Delinquent</SelectItem>
              <SelectItem value="probate">Probate</SelectItem>
              <SelectItem value="fsbo">FSBO</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <i className="fas fa-plus mr-2"></i> Add Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* New Leads Column */}
        <div>
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">New Leads</h3>
              <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {filteredNewLeads.length}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-2 h-auto min-h-[400px] max-h-[600px] overflow-y-auto rounded-b-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading leads...</div>
            ) : filteredNewLeads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No new leads found</div>
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
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Contacted</h3>
              <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {filteredContactedLeads.length}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-2 h-auto min-h-[400px] max-h-[600px] overflow-y-auto rounded-b-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading leads...</div>
            ) : filteredContactedLeads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No contacted leads found</div>
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
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Closed</h3>
              <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {filteredClosedLeads.length}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-2 h-auto min-h-[400px] max-h-[600px] overflow-y-auto rounded-b-lg">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading leads...</div>
            ) : filteredClosedLeads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No closed leads found</div>
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
