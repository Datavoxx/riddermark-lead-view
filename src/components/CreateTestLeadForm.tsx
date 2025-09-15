import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";
import { CreateTestLeadRequest } from "@/types/lead";

interface CreateTestLeadFormProps {
  onLeadCreated: () => void;
}

export const CreateTestLeadForm = ({ onLeadCreated }: CreateTestLeadFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTestLeadRequest>({
    blocket_url: '',
    lead_namn: '',
    lead_email: '',
    regnr: '',
    summary: '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, get preview data from URL
      const previewResponse = await fetch('https://fjqsaixszaqceviqwboz.functions.supabase.co/api-url-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formData.blocket_url }),
      });

      if (!previewResponse.ok) {
        throw new Error('Failed to get URL preview');
      }

      const previewData = await previewResponse.json();

      // Then create the lead
      const leadResponse = await fetch('https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads/incoming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: `Test lead - ${formData.lead_namn}`,
          preview: {
            title: previewData.title || 'Blocket Annons',
            description: previewData.description || '',
            image_url: previewData.image_url || '',
          }
        }),
      });

      if (!leadResponse.ok) {
        throw new Error('Failed to create test lead');
      }

      toast({
        title: "Test-lead skapad",
        description: "Det nya test-leadet har skapats framgångsrikt.",
      });

      setIsOpen(false);
      setFormData({
        blocket_url: '',
        lead_namn: '',
        lead_email: '',
        regnr: '',
        summary: '',
      });
      onLeadCreated();
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa test-lead. Kontrollera att URL:en är giltig.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateTestLeadRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mb-4">
          <Plus className="h-4 w-4 mr-2" />
          Skapa test-lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Skapa test-lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <Label htmlFor="blocket_url">Blocket URL</Label>
            <Input
              id="blocket_url"
              type="url"
              value={formData.blocket_url}
              onChange={(e) => updateFormData('blocket_url', e.target.value)}
              placeholder="https://www.blocket.se/..."
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Label htmlFor="lead_namn">Namn</Label>
            <Input
              id="lead_namn"
              value={formData.lead_namn}
              onChange={(e) => updateFormData('lead_namn', e.target.value)}
              placeholder="John Doe"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Label htmlFor="lead_email">E-post</Label>
            <Input
              id="lead_email"
              type="email"
              value={formData.lead_email}
              onChange={(e) => updateFormData('lead_email', e.target.value)}
              placeholder="john@example.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Label htmlFor="regnr">Registreringsnummer</Label>
            <Input
              id="regnr"
              value={formData.regnr}
              onChange={(e) => updateFormData('regnr', e.target.value)}
              placeholder="ABC123"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <Label htmlFor="summary">Sammanfattning</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => updateFormData('summary', e.target.value)}
              placeholder="Kort beskrivning av leadet..."
              rows={3}
              required
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full animate-slide-up" 
            style={{ animationDelay: "0.6s" }}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Skapa lead
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};