import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { Lead } from "@/types/lead";
import { ClaimButton } from "./ClaimButton";
import { LinkPreview } from "./LinkPreview";
import { VoiceRecorder } from "./VoiceRecorder";

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
        <div className="flex items-center gap-2 pl-12">
          <span className="text-lg">🧾</span>
          <h2 className="font-semibold text-foreground">Sammanfattning: "{lead.summering || ''}"</h2>
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
            <strong>Namn:</strong> {lead.lead_namn}
          </div>
          
          <div>
            <strong>Email:</strong> {lead.lead_email}
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <ClaimButton leadId={lead.id} onClaim={onClaim} />
        </div>

        {/* Voice Recorder Section */}
        <div className="bg-muted/20 p-4 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🎙️</span>
            <h3 className="font-semibold text-sm text-foreground">Röstinspelning</h3>
          </div>
          <VoiceRecorder
            onRecordingComplete={(audioBlob) => {
              console.log("Recording complete:", audioBlob);
              // TODO: Send audio to backend
            }}
          />
        </div>

        {/* Link Preview */}
        <div className="pt-2">
          <LinkPreview lead={lead} />
        </div>
      </div>
    </div>
  );
};