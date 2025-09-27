import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { LeadCard } from "@/components/LeadCard";
import { LeadCardSkeleton } from "@/components/LeadCardSkeleton";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      const response = await fetch(`https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads/${id}?t=${Date.now()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ärendet hittades inte');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Received lead data:', data);
      console.log('Summering field:', data.summering);
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
          <LeadCard lead={lead} onClaim={handleClaim} />
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