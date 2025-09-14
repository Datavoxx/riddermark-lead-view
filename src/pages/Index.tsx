import { useState, useEffect } from "react";
import { Lead } from "@/types/lead";
import { LeadCard } from "@/components/LeadCard";
import { LeadCardSkeleton } from "@/components/LeadCardSkeleton";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLatestLead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads?limit=1&order=created_at.desc');
      
      if (!response.ok) {
        // Mock data for testing when API is not available
        const mockLead: Lead = {
          id: "mock-lead-1",
          summary: "Kund intresserad av en Volvo XC90 2019. Vill veta mer om service-historia och om bilen är olyckskadd. Kan komma och titta på bilen under helgen.",
          lead_namn: "Anna Andersson",
          lead_email: "anna.andersson@email.com",
          regnr: "ABC123",
          subject: "Intresse för Volvo XC90 2019 - ABC123",
          blocket_url: "https://www.blocket.se/annons/stockholm/volvo_xc90_2019/12345",
          preview_title: "Volvo XC90 T6 AWD Inscription 2019",
          preview_description: "Välskött Volvo XC90 i toppskick. Servicebok finns, inga olyckor. Endast 85 000 km. Panoramatak, navi, backkamera.",
          preview_image_url: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=225&fit=crop",
          created_at: new Date().toISOString(),
        };
        setLead(mockLead);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setLead(data[0]);
      } else {
        // No leads found
        setLead(null);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta leadet. Använder test-data.",
        variant: "destructive",
      });
      
      // Fallback to mock data
      const mockLead: Lead = {
        id: "mock-lead-1",
        summary: "Kund intresserad av en Volvo XC90 2019. Vill veta mer om service-historia och om bilen är olyckskadd. Kan komma och titta på bilen under helgen.",
        lead_namn: "Anna Andersson",
        lead_email: "anna.andersson@email.com",
        regnr: "ABC123",
        subject: "Intresse för Volvo XC90 2019 - ABC123",
        blocket_url: "https://www.blocket.se/annons/stockholm/volvo_xc90_2019/12345",
        preview_title: "Volvo XC90 T6 AWD Inscription 2019",
        preview_description: "Välskött Volvo XC90 i toppskick. Servicebok finns, inga olyckor. Endast 85 000 km. Panoramatak, navi, backkamera.",
        preview_image_url: "https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=400&h=225&fit=crop",
        created_at: new Date().toISOString(),
      };
      setLead(mockLead);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestLead();
  }, []);

  const handleLeadClaimed = () => {
    // Refresh the lead data after claiming
    fetchLatestLead();
  };

  const handleLeadCreated = () => {
    // Refresh the lead data after creating a new test lead
    fetchLatestLead();
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ThemeToggle />
      
      {/* Header */}
      <div className="pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Riddermark Lead Test
        </h1>
        <p className="text-muted-foreground">
          Slack-stil leadkort för testning
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        <div className="flex justify-center mb-6">
          <CreateTestLeadForm onLeadCreated={handleLeadCreated} />
        </div>

        {isLoading ? (
          <LeadCardSkeleton />
        ) : lead ? (
          <LeadCard lead={lead} onClaim={handleLeadClaimed} />
        ) : (
          <div className="w-full max-w-2xl mx-auto bg-slack-card border border-slack-border rounded-lg shadow-sm p-8 text-center">
            <p className="text-muted-foreground">
              Inga leads hittades. Skapa ett test-lead för att komma igång.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
