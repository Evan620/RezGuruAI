import { Button } from "@/components/ui/button";
import { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface LeadCardProps {
  lead: Lead;
  onUpdateStatus: (leadId: number, status: string) => void;
  showContactInfo?: boolean;
  showDealInfo?: boolean;
}

export default function LeadCard({ 
  lead, 
  onUpdateStatus,
  showContactInfo = false,
  showDealInfo = false
}: LeadCardProps) {
  // Format address
  const formattedAddress = `${lead.address}, ${lead.city} ${lead.state}`;
  
  // Get source badge color
  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "tax_delinquent":
        return "bg-blue-100 text-blue-800";
      case "probate":
        return "bg-purple-100 text-purple-800";
      case "fsbo":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Get source display name
  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case "tax_delinquent":
        return "Tax Delinquent";
      case "probate":
        return "Probate";
      case "fsbo":
        return "FSBO";
      default:
        return source;
    }
  };
  
  // Get motivation score badge color
  const getScoreBadgeColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 85) return "bg-accent-100 text-accent-800";
    if (score >= 70) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };
  
  return (
    <div className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-200 cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{lead.name}</h4>
          <p className="text-sm text-gray-500">{formattedAddress}</p>
        </div>
        <span className={cn(
          "text-xs font-semibold px-2.5 py-1 rounded-full",
          getScoreBadgeColor(lead.motivationScore)
        )}>
          {lead.motivationScore || "N/A"}
        </span>
      </div>
      
      {showContactInfo && (
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            {lead.phone && (
              <>
                <i className="fas fa-phone-alt"></i>
                <span>Called {format(new Date(lead.updatedAt), 'PP')}</span>
              </>
            )}
            {lead.email && !lead.phone && (
              <>
                <i className="fas fa-envelope"></i>
                <span>Email sent {format(new Date(lead.updatedAt), 'PP')}</span>
              </>
            )}
            {!lead.phone && !lead.email && (
              <>
                <i className="fas fa-sms"></i>
                <span>SMS sent {format(new Date(lead.updatedAt), 'PP')}</span>
              </>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded",
              getSourceBadgeColor(lead.source)
            )}>
              {getSourceDisplayName(lead.source)}
            </span>
            <Button 
              variant="ghost" 
              className="text-primary-600 hover:text-primary-800 text-xs font-medium"
              onClick={() => onUpdateStatus(lead.id, lead.status === "contacted" ? "closed" : "new")}
            >
              {lead.status === "contacted" ? "Mark Closed" : "Reset"}
            </Button>
          </div>
        </div>
      )}
      
      {showDealInfo && (
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
            <i className="fas fa-check-circle text-green-500"></i>
            <span>Deal closed on {format(new Date(lead.updatedAt), 'PP')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded",
              getSourceBadgeColor(lead.source)
            )}>
              {getSourceDisplayName(lead.source)}
            </span>
            <span className="text-green-600 text-xs font-medium">
              {lead.amountOwed || "$150,000"}
            </span>
          </div>
        </div>
      )}
      
      {!showContactInfo && !showDealInfo && (
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded",
            getSourceBadgeColor(lead.source)
          )}>
            {getSourceDisplayName(lead.source)}
          </span>
          <span className="ml-auto text-xs">
            Added {format(new Date(lead.createdAt), 'dd')}d ago
          </span>
        </div>
      )}
    </div>
  );
}
