import { useQuery } from "@tanstack/react-query";
import { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentList from "@/components/documents/DocumentList";

export default function Documents() {
  // Fetch all documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  // Group documents by type
  const contracts = documents?.filter(doc => doc.type === "contract") || [];
  const disputeLetters = documents?.filter(doc => doc.type === "dispute_letter") || [];
  const offers = documents?.filter(doc => doc.type === "offer") || [];
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-gray-500">Create and manage real estate documents</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border border-gray-300 bg-white text-gray-700">
            <i className="fas fa-upload mr-2"></i> Upload
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <i className="fas fa-plus mr-2"></i> Create Document
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Documents ({documents?.length || 0})</TabsTrigger>
          <TabsTrigger value="contracts">Contracts ({contracts.length})</TabsTrigger>
          <TabsTrigger value="disputes">Dispute Letters ({disputeLetters.length})</TabsTrigger>
          <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <DocumentList documents={documents} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="contracts">
          <DocumentList documents={contracts} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="disputes">
          <DocumentList documents={disputeLetters} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="offers">
          <DocumentList documents={offers} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
      
      {/* Document Templates */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Document Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-md bg-blue-100 p-3 text-blue-600 flex-shrink-0 mr-3">
                  <i className="fas fa-file-contract text-xl"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Purchase Agreement</h3>
                  <p className="text-sm text-gray-500">Standard real estate purchase contract</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-md bg-purple-100 p-3 text-purple-600 flex-shrink-0 mr-3">
                  <i className="fas fa-gavel text-xl"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">FCRA Dispute Letter</h3>
                  <p className="text-sm text-gray-500">Credit report dispute template</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:bg-gray-50 cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="rounded-md bg-green-100 p-3 text-green-600 flex-shrink-0 mr-3">
                  <i className="fas fa-file-invoice-dollar text-xl"></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Cash Offer</h3>
                  <p className="text-sm text-gray-500">Quick cash purchase offer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
