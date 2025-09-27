import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { LeadCard } from "@/components/LeadCard";
import { LeadCardSkeleton } from "@/components/LeadCardSkeleton";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import blocketSummaryImage from "@/assets/blocket-summary.png";

export default function ArendeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLead = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ärendet hittades inte');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte hämta ärendet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleClaim = () => {
    // Refresh the lead data after claiming
    fetchLead();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title={lead ? `Ärende: ${lead.subject}` : "Ärende"} />
      
      <main className="p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blocket/arenden')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till ärenden
          </Button>
        </div>
        
        {loading ? (
          <LeadCardSkeleton />
        ) : lead ? (
          <div className="space-y-6">
            {/* Blocket Summary Section with Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📄 Sammanfattning
                  <span className="text-sm text-muted-foreground">summering</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Display the image first */}
                <div className="flex justify-center mb-4">
                  <img 
                    src={blocketSummaryImage} 
                    alt="Blocket Summary" 
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
                
                {/* Information matching the image layout */}
                <div className="space-y-3">
                  <div>
                    <strong>Mejl från Blocket:</strong>{" "}
                    {lead.blocket_url ? (
                      <a 
                        href={lead.blocket_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      "Ingen länk tillgänglig"
                    )}
                  </div>
                  
                  <div>
                    <strong>Datum/tid:</strong>{" "}
                    {lead.created_at ? new Date(lead.created_at).toLocaleString('sv-SE') : "Invalid Date"}
                  </div>
                  
                  <div>
                    <strong>Reg.nr:</strong> {lead.regnr || ""}
                  </div>
                  
                  <div>
                    <strong>Meddelande:</strong>
                    <div className="mt-1 p-2 bg-muted rounded">
                      {lead.summary || "Inget meddelande"}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Namn/Email:</strong> {lead.lead_namn || ""}, {lead.lead_email || ""}
                  </div>
                </div>

                {/* Blocket section with red dot */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="font-medium">Blocket</span>
                    </div>
                    {lead.blocket_url && (
                      <a 
                        href={lead.blocket_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Original Lead Card */}
            <LeadCard lead={lead} onClaim={handleClaim} />
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Ärendet hittades inte</h2>
            <p className="text-muted-foreground">
              Det ärendet du söker efter existerar inte eller har tagits bort.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}