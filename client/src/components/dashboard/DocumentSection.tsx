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
        <h3 className="text-lg font-semibold text-[#F8F9FA]">DOCUMENT ARCHIVE</h3>
        <div className="flex space-x-2">
          <Button variant="outline" className="border border-[#2A2A3A] bg-[#20223A] text-[#F8F9FA] hover:bg-[#2A2A3A] hover:text-[#00F5D4]">
            <span className="mr-2">↑</span> Upload
          </Button>
          <Button className="bg-[#6E56CF] hover:bg-[#5D46BD] text-white">
            <span className="mr-2">+</span> Create Document
          </Button>
        </div>
      </div>

      {/* Document List */}
      <DocumentList documents={documents} isLoading={isLoading} />
    </div>
  );
}
