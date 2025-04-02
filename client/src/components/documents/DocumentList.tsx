import { useState } from "react";
import { Document } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DocumentListProps {
  documents?: Document[];
  isLoading: boolean;
}

export default function DocumentList({ documents, isLoading }: DocumentListProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
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
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Documents</h3>
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading documents...
                </td>
              </tr>
            ) : paginatedDocuments?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No documents found
                </td>
              </tr>
            ) : (
              paginatedDocuments?.map(document => (
                <tr key={document.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className="fas fa-file-pdf text-red-500 mr-3"></i>
                      <div className="text-sm font-medium text-gray-900">{document.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {document.type === "dispute_letter" ? "Dispute Letter" : 
                       document.type === "contract" ? "Contract" : 
                       document.type === "offer" ? "Offer" : 
                       document.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {document.leadId ? `Lead #${document.leadId}` : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(document.createdAt), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(document.status)}`}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {document.status === "draft" ? (
                      <a href="#" className="text-primary-600 hover:text-primary-900 mr-3">Edit</a>
                    ) : (
                      <a href="#" className="text-primary-600 hover:text-primary-900 mr-3">View</a>
                    )}
                    <a href="#" className="text-primary-600 hover:text-primary-900">Download</a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {filteredDocuments && filteredDocuments.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
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
                  size="sm"
                  className="border border-gray-300 rounded-l-md px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className={`border-t border-b border-gray-300 px-3 py-1 text-sm ${
                      currentPage === i + 1 ? "bg-primary-50 text-primary-700 font-medium" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-gray-300 rounded-r-md px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
