import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Mic } from "lucide-react";
import { Lead } from "@/types/lead";
import { ClaimButton } from "./ClaimButton";
import { LinkPreview } from "./LinkPreview";

interface LeadCardProps {
  lead: Lead;
  onClaim: () => void;
}

export const LeadCard = ({ lead, onClaim }: LeadCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openBlocketUrl = () => {
    window.open(lead.blocket_url, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slack-card border border-primary/20 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="px-4 py-3 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">🧾</span>
          <h2 className="font-semibold text-foreground">Sammanfattning</h2>
          <Badge variant="secondary" className="bg-slack-tag text-xs">
            summering
          </Badge>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <div className="font-mono text-sm space-y-2 bg-muted/30 p-3 rounded-md">
          <div>
            <strong>Mejl från Blocket:</strong> {lead.subject}
            <button
              onClick={openBlocketUrl}
              className="ml-2 text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          
          {/* Bilden från preview_image_url - TOTAL DEBUG VERSION */}
          <div className="mt-3 p-4 border-2 border-red-500 bg-red-50">
            <div className="text-sm font-bold text-red-700 mb-2">
              🔍 BILDDEBUG - URL: {lead.preview_image_url}
            </div>
            <div className="text-xs text-red-600 mb-2">
              Lead ID: {lead.id}
            </div>
            
            {/* Testar olika bildvarianter */}
            <div className="space-y-4">
              {/* Version 1: Original URL */}
              <div>
                <div className="text-xs font-semibold mb-1">Test 1: Original URL</div>
                <img
                  src={lead.preview_image_url}
                  alt="Test 1"
                  className="w-full max-w-sm h-32 object-cover rounded border-2 border-blue-500"
                  onLoad={() => console.log('✅ Test 1 LOADED:', lead.preview_image_url)}
                  onError={(e) => {
                    console.error('❌ Test 1 FAILED:', lead.preview_image_url);
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.innerHTML = 'FAILED';
                  }}
                />
              </div>

              {/* Version 2: Fallback URL */}
              <div>
                <div className="text-xs font-semibold mb-1">Test 2: Fallback URL</div>
                <img
                  src="https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=225&fit=crop"
                  alt="Test 2"
                  className="w-full max-w-sm h-32 object-cover rounded border-2 border-green-500"
                  onLoad={() => console.log('✅ Test 2 LOADED: Fallback')}
                  onError={() => console.error('❌ Test 2 FAILED: Fallback')}
                />
              </div>

              {/* Version 3: Direkttest av Blocket URL */}
              <div>
                <div className="text-xs font-semibold mb-1">Test 3: Direkt Blocket URL</div>
                <img
                  src="https://i.blocketcdn.se/pictures/asl/1003063172/4100701146.jpg"
                  alt="Test 3"
                  className="w-full max-w-sm h-32 object-cover rounded border-2 border-purple-500"
                  onLoad={() => console.log('✅ Test 3 LOADED: Direct Blocket')}
                  onError={() => console.error('❌ Test 3 FAILED: Direct Blocket')}
                />
              </div>
            </div>
          </div>
          
          <div>
            <strong>Datum/tid:</strong> {formatDate(lead.created_at)}
          </div>
          
          <div>
            <strong>Reg.nr:</strong> {lead.regnr}
          </div>
          
          <div>
            <strong>Meddelande:</strong>
            <div className="pl-4 mt-1 text-muted-foreground">
              {lead.summary}
            </div>
          </div>
          
          <div>
            <strong>Namn/Email:</strong> {lead.lead_namn}, {lead.lead_email}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <ClaimButton leadId={lead.id} onClaim={onClaim} />
          
          <Button variant="secondary" disabled className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Skicka röstmeddelande 🎙️
          </Button>
        </div>

        {/* Link Preview */}
        <div className="pt-2">
          <LinkPreview lead={lead} />
        </div>
      </div>
    </div>
  );
};