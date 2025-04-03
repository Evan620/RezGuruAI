import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, DocumentTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText, Upload, Plus } from "lucide-react";
import DocumentList from "@/components/documents/DocumentList";
import DocumentGenerator from "@/components/documents/DocumentGenerator";
import DocumentViewer from "@/components/documents/DocumentViewer";
import DocumentTemplateCard from "@/components/documents/DocumentTemplateCard";

export default function Documents() {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Fetch all documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  // Fetch document templates
  const { data: templates, isLoading: templatesLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ["/api/document-templates"],
  });
  
  // Group documents by type
  const contracts = documents?.filter(doc => doc.type === "contract") || [];
  const disputeLetters = documents?.filter(doc => doc.type === "dispute_letter") || [];
  const offers = documents?.filter(doc => doc.type === "offer") || [];
  
  // Handle document view
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };
  
  // Handle document update
  const handleDocumentUpdated = (updatedDocument: Document) => {
    setSelectedDocument(null);
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="mt-1 text-muted-foreground">Create and manage real estate documents</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Button onClick={() => setIsGeneratorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Document
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Document Templates</h2>
          <Button variant="ghost" onClick={() => setIsGeneratorOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Create From Template
          </Button>
        </div>
        
        {templatesLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates?.map((template) => (
              <DocumentTemplateCard
                key={template.id}
                template={template}
                onSelect={() => {
                  setIsGeneratorOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Document Generator Dialog */}
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DocumentGenerator onClose={() => setIsGeneratorOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Document Viewer Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DocumentViewer 
              document={selectedDocument} 
              onEdit={handleDocumentUpdated}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
