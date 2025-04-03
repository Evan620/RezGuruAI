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
          <Button 
            variant="outline"
            onClick={() => {
              // Create a dialog for document upload
              const dialog = document.createElement('dialog');
              dialog.id = 'uploadDocumentDialog';
              dialog.style.position = 'fixed';
              dialog.style.top = '50%';
              dialog.style.left = '50%';
              dialog.style.transform = 'translate(-50%, -50%)';
              dialog.style.padding = '20px';
              dialog.style.background = '#fff';
              dialog.style.borderRadius = '8px';
              dialog.style.zIndex = '1000';
              dialog.style.minWidth = '400px';
              dialog.style.maxWidth = '600px';
              
              // Add dialog content
              dialog.innerHTML = `
                <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                  <span>Upload Document</span>
                  <button id="closeDialog" style="background: none; border: none; cursor: pointer; font-size: 20px;">&times;</button>
                </h2>
                <form id="uploadDocumentForm">
                  <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px;">Document Name</label>
                    <input id="documentName" type="text" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="Document Name" required />
                  </div>
                  <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px;">Document Type</label>
                    <select id="documentType" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                      <option value="contract">Contract</option>
                      <option value="dispute_letter">Dispute Letter</option>
                      <option value="offer">Offer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px;">Associated Lead (Optional)</label>
                    <select id="documentLead" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                      <option value="">None</option>
                    </select>
                  </div>
                  <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px;">File</label>
                    <div style="border: 2px dashed #ddd; padding: 20px; text-align: center; border-radius: 4px;">
                      <p>Drag and drop your file here, or</p>
                      <input type="file" id="documentFile" style="margin-top: 10px;" />
                    </div>
                  </div>
                  <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-size: 14px;">Notes</label>
                    <textarea id="documentNotes" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 80px;" placeholder="Additional notes about this document..."></textarea>
                  </div>
                  <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
                    <button type="button" id="cancelButton" style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Cancel</button>
                    <button type="submit" style="padding: 8px 16px; background: #6E56CF; border: none; border-radius: 4px; color: white; cursor: pointer;">Upload Document</button>
                  </div>
                </form>
              `;
              
              document.body.appendChild(dialog);
              dialog.showModal();
              
              // Populate leads dropdown
              fetch('/api/leads')
                .then(response => response.json())
                .then(leads => {
                  const leadSelect = document.getElementById('documentLead') as HTMLSelectElement;
                  if (leadSelect && leads && Array.isArray(leads)) {
                    leads.forEach(lead => {
                      const option = document.createElement('option');
                      option.value = String(lead.id);
                      option.textContent = lead.name;
                      leadSelect.appendChild(option);
                    });
                  }
                })
                .catch(error => {
                  console.error('Error fetching leads:', error);
                });
              
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
              document.getElementById('uploadDocumentForm')?.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const name = (document.getElementById('documentName') as HTMLInputElement).value;
                const type = (document.getElementById('documentType') as HTMLSelectElement).value;
                const leadId = (document.getElementById('documentLead') as HTMLSelectElement).value;
                const notes = (document.getElementById('documentNotes') as HTMLTextAreaElement).value;
                const fileInput = document.getElementById('documentFile') as HTMLInputElement;
                
                if (!fileInput.files || fileInput.files.length === 0) {
                  alert('Please select a file to upload.');
                  return;
                }
                
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = async (event) => {
                  const content = event.target?.result as string || '';
                  
                  try {
                    const response = await fetch('/api/documents', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        name,
                        type,
                        leadId: leadId ? parseInt(leadId) : null,
                        content,
                        notes,
                        format: file.type,
                        status: 'draft'
                      }),
                    });
                    
                    if (response.ok) {
                      // Close the dialog
                      dialog.close();
                      document.body.removeChild(dialog);
                      
                      // Show success message
                      alert('Document uploaded successfully!');
                      
                      // Refresh the page to show the new document
                      window.location.reload();
                    } else {
                      console.error('Failed to upload document:', await response.text());
                      alert('Failed to upload document. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error uploading document:', error);
                    alert('An error occurred while uploading the document.');
                  }
                };
                
                reader.readAsText(file);
              });
            }}
          >
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
