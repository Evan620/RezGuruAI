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
        return "bg-[#6E56CF]/20 text-[#6E56CF] border border-[#6E56CF]/30";
      case "probate":
        return "bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30";
      case "fsbo":
        return "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/30";
      default:
        return "bg-[#CCCED0]/20 text-[#CCCED0] border border-[#CCCED0]/30";
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
    if (!score) return "bg-[#2A2A3A] text-[#CCCED0] border border-[#2A2A3A]";
    if (score >= 85) return "bg-[#00F5D4]/20 text-[#00F5D4] border border-[#00F5D4]/30";
    if (score >= 70) return "bg-[#6E56CF]/20 text-[#6E56CF] border border-[#6E56CF]/30";
    return "bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30";
  };
  
  return (
    <div className="bg-[#20223A] p-4 rounded mb-3 border border-[#2A2A3A] cursor-pointer hover:border-[#6E56CF]/50 transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-[#F8F9FA]">{lead.name}</h4>
          <p className="text-xs text-[#CCCED0] monospace-text">{formattedAddress}</p>
        </div>
        <span className={cn(
          "text-xs monospace-text px-2.5 py-1 rounded",
          getScoreBadgeColor(lead.motivationScore)
        )}>
          {lead.motivationScore || "N/A"}
        </span>
      </div>
      
      {showContactInfo && (
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-xs text-[#CCCED0] mb-1">
            {lead.phone && (
              <>
                <span className="text-[#6E56CF]">○</span>
                <span className="monospace-text">Called {format(new Date(lead.updatedAt), 'PP')}</span>
              </>
            )}
            {lead.email && !lead.phone && (
              <>
                <span className="text-[#6E56CF]">◇</span>
                <span className="monospace-text">Email sent {format(new Date(lead.updatedAt), 'PP')}</span>
              </>
            )}
            {!lead.phone && !lead.email && (
              <>
                <span className="text-[#6E56CF]">△</span>
                <span className="monospace-text">SMS sent {format(new Date(lead.updatedAt), 'PP')}</span>
              </>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded monospace-text",
              getSourceBadgeColor(lead.source)
            )}>
              {getSourceDisplayName(lead.source)}
            </span>
            <Button 
              variant="ghost" 
              className="text-[#6E56CF] hover:text-[#5D46BD] hover:bg-[#2A2A3A] text-xs monospace-text"
              onClick={() => onUpdateStatus(lead.id, lead.status === "contacted" ? "closed" : "new")}
            >
              {lead.status === "contacted" ? "Mark Acquired" : "Reset"}
            </Button>
          </div>
        </div>
      )}
      
      {showDealInfo && (
        <div className="mt-3">
          <div className="flex items-center space-x-2 text-xs text-[#CCCED0] mb-1">
            <span className="text-[#00F5D4]">✓</span>
            <span className="monospace-text">Acquired on {format(new Date(lead.updatedAt), 'PP')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded monospace-text",
              getSourceBadgeColor(lead.source)
            )}>
              {getSourceDisplayName(lead.source)}
            </span>
            <span className="text-[#00F5D4] text-xs monospace-text">
              {lead.amountOwed || "$150,000"}
            </span>
          </div>
        </div>
      )}
      
      {!showContactInfo && !showDealInfo && (
        <div className="mt-3 flex items-center">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded monospace-text",
            getSourceBadgeColor(lead.source)
          )}>
            {getSourceDisplayName(lead.source)}
          </span>
          <span className="ml-auto text-xs text-[#CCCED0] monospace-text">
            Added {format(new Date(lead.createdAt), 'dd')}d ago
          </span>
        </div>
      )}
    </div>
  );
}
