import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Lead } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LeadCard from "@/components/leads/LeadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  
  // Fetch all leads
  const { data: allLeads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
  
  // Filter leads
  const filteredLeads = allLeads
    ?.filter(lead => {
      // Filter by search query
      if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by source
      if (selectedSource !== "all" && lead.source !== selectedSource) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by motivation score (high to low)
      return (b.motivationScore || 0) - (a.motivationScore || 0);
    });
  
  // Group leads by status
  const newLeads = filteredLeads?.filter(lead => lead.status === "new") || [];
  const contactedLeads = filteredLeads?.filter(lead => lead.status === "contacted") || [];
  const closedLeads = filteredLeads?.filter(lead => lead.status === "closed") || [];
  
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
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-1 text-gray-500">Manage and track your real estate leads</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <i className="fas fa-plus mr-2"></i> Add Lead
        </Button>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3 py-2 rounded-md border border-gray-300 bg-gray-50 focus:ring-primary-500 focus:border-primary-500 w-full"
              placeholder="Search by name..."
            />
          </div>
        </div>
        <div className="w-full md:w-1/4">
          <Select 
            value={selectedSource}
            onValueChange={setSelectedSource}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Lead Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lead Sources</SelectItem>
              <SelectItem value="tax_delinquent">Tax Delinquent</SelectItem>
              <SelectItem value="probate">Probate</SelectItem>
              <SelectItem value="fsbo">FSBO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/4">
          <Button variant="outline" className="w-full">
            <i className="fas fa-filter mr-2"></i> More Filters
          </Button>
        </div>
      </div>
      
      {/* Tabs with Lead Status */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Leads ({filteredLeads?.length || 0})</TabsTrigger>
          <TabsTrigger value="new">New ({newLeads.length})</TabsTrigger>
          <TabsTrigger value="contacted">Contacted ({contactedLeads.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closedLeads.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  Loading leads...
                </CardContent>
              </Card>
            ) : filteredLeads?.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  No leads found matching your filters
                </CardContent>
              </Card>
            ) : (
              filteredLeads?.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                  showContactInfo={lead.status === "contacted"}
                  showDealInfo={lead.status === "closed"}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="new">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  Loading leads...
                </CardContent>
              </Card>
            ) : newLeads.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  No new leads found
                </CardContent>
              </Card>
            ) : (
              newLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="contacted">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  Loading leads...
                </CardContent>
              </Card>
            ) : contactedLeads.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  No contacted leads found
                </CardContent>
              </Card>
            ) : (
              contactedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                  showContactInfo
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="closed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  Loading leads...
                </CardContent>
              </Card>
            ) : closedLeads.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center text-gray-500">
                  No closed leads found
                </CardContent>
              </Card>
            ) : (
              closedLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onUpdateStatus={handleUpdateLeadStatus}
                  showDealInfo
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
