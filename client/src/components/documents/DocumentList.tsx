import { useState } from "react";
import { Document } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, FileEdit, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DocumentViewer from "./DocumentViewer";

interface DocumentListProps {
  documents?: Document[];
  isLoading: boolean;
}

export default function DocumentList({ documents, isLoading }: DocumentListProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const itemsPerPage = 4;
  
  // Filter documents by type if selected
  const filteredDocuments = selectedType === "all"
    ? documents
    : documents?.filter(doc => doc.type === selectedType);
  
  // Pagination
  const totalPages = filteredDocuments 
    ? Math.ceil(filteredDocuments.length / itemsPerPage)
    : 0;
  
  const paginatedDocuments = filteredDocuments
    ? filteredDocuments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Type options
  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "contract", label: "Contracts" },
    { value: "dispute_letter", label: "Dispute Letters" },
    { value: "offer", label: "Offers" }
  ];

  // Handle document view
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };
  
  // Handle document update
  const handleDocumentUpdated = (updatedDocument: Document) => {
    setSelectedDocument(null);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <div className="px-4 py-5 border-b sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Documents</h3>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Document</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedDocuments?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-muted-foreground">
                    No documents found
                  </td>
                </tr>
              ) : (
                paginatedDocuments?.map(document => (
                  <tr key={document.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleViewDocument(document)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-red-500 mr-3" />
                        <div className="text-sm font-medium">{document.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {document.type === "dispute_letter" ? "Dispute Letter" : 
                         document.type === "contract" ? "Contract" : 
                         document.type === "offer" ? "Offer" : 
                         document.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {document.leadId ? `Lead #${document.leadId}` : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {format(new Date(document.createdAt), 'PP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(document.status)}`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {document.status === "draft" ? (
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(document);
                        }}>
                          <FileEdit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(document);
                        }}>
                          <FileText className="h-4 w-4 mr-1" /> View
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredDocuments && filteredDocuments.length > 0 && (
          <div className="bg-muted/20 px-4 py-3 border-t sm:px-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredDocuments.length)}
                </span>{" "}
                of <span className="font-medium">{filteredDocuments.length}</span> documents
              </div>
              <div>
                <nav className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-md"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {totalPages <= 5 ? (
                    [...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 w-8 rounded-none"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))
                  ) : (
                    <>
                      {/* First page */}
                      <Button
                        variant={currentPage === 1 ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 w-8 rounded-none"
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </Button>
                      
                      {/* Ellipsis or pages */}
                      {currentPage > 3 && (
                        <Button variant="outline" size="sm" className="h-8 w-8 rounded-none" disabled>
                          ...
                        </Button>
                      )}
                      
                      {/* Pages around current */}
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          (pageNum !== 1 && pageNum !== totalPages) &&
                          (Math.abs(pageNum - currentPage) < 2)
                        ) {
                          return (
                            <Button
                              key={i}
                              variant={currentPage === pageNum ? "secondary" : "outline"}
                              size="sm"
                              className="h-8 w-8 rounded-none"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                        return null;
                      })}
                      
                      {/* Ellipsis or pages */}
                      {currentPage < totalPages - 2 && (
                        <Button variant="outline" size="sm" className="h-8 w-8 rounded-none" disabled>
                          ...
                        </Button>
                      )}
                      
                      {/* Last page */}
                      <Button
                        variant={currentPage === totalPages ? "secondary" : "outline"}
                        size="sm"
                        className="h-8 w-8 rounded-none"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-md"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </Card>
      
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
    </>
  );
}
