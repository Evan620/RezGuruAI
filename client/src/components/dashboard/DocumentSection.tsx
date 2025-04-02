import { useQuery } from "@tanstack/react-query";
import { Document } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DocumentList from "../documents/DocumentList";

export default function DocumentSection() {
  // Fetch documents
  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });
  
  return (
    <div>
      <div className="mb-5 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Documents</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="border border-gray-300 bg-white text-gray-700">
            <i className="fas fa-upload mr-2"></i> Upload
          </Button>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <i className="fas fa-plus mr-2"></i> Create Document
          </Button>
        </div>
      </div>

      {/* Document List */}
      <DocumentList documents={documents} isLoading={isLoading} />
    </div>
  );
}
