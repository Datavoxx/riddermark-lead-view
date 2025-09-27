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
          
          {/* Debug info för preview_image_url */}
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <strong>Debug - Bild URL:</strong> {lead.preview_image_url || 'Ingen bild-URL hittades'}
          </div>
          
          {lead.preview_image_url && (
            <div className="mt-2 p-2 border border-green-200 rounded bg-green-50">
              <div className="text-xs text-green-700 mb-2">Försöker ladda bild från: {lead.preview_image_url}</div>
              <img
                src={lead.preview_image_url}
                alt={lead.preview_title || 'Blocket annons'}
                className="w-full max-w-sm h-32 object-cover rounded-md border-2 border-primary/20 bg-gray-100"
                style={{ minHeight: '128px', backgroundColor: '#f3f4f6', display: 'block' }}
                onLoad={(e) => {
                  console.log('✅ Image loaded successfully:', lead.preview_image_url);
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.parentElement.style.backgroundColor = '#dcfce7';
                }}
                onError={(e) => {
                  console.error('❌ Image failed to load:', lead.preview_image_url);
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.display = 'flex';
                  e.currentTarget.style.alignItems = 'center';
                  e.currentTarget.style.justifyContent = 'center';
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.fontSize = '12px';
                  e.currentTarget.innerHTML = '⚠️ Kunde inte ladda bilden';
                  e.currentTarget.parentElement.style.backgroundColor = '#fef2f2';
                }}
              />
            </div>
          )}
          
          {!lead.preview_image_url && (
            <div className="mt-2 p-2 border border-red-300 rounded bg-red-50 text-red-700 text-xs">
              ⚠️ Ingen bild-URL hittades i databasen för detta lead
            </div>
          )}
          
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