import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";

interface ClaimButtonProps {
  leadId: string;
  onClaim: () => void;
}

export const ClaimButton = ({ leadId, onClaim }: ClaimButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const { toast } = useToast();

  const handleClaim = async () => {
    setIsLoading(true);
    setIsConflict(false);

    try {
      const response = await fetch('https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads-claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      });

      if (response.status === 200) {
        setIsClaimed(true);
        toast({
          title: "Ärendet upplockat",
          description: "Du har tagit över ärendet framgångsrikt.",
        });
        onClaim();
      } else if (response.status === 409) {
        setIsConflict(true);
        toast({
          title: "Redan plockad",
          description: "Ärendet har redan plockats av en annan säljare.",
          variant: "destructive",
        });
      } else {
        throw new Error('Failed to claim lead');
      }
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ta över ärendet. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isClaimed) {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        <Button variant="secondary" disabled className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success animate-glow" />
          Ta över ärendet
        </Button>
        <Badge variant="secondary" className="bg-success text-success-foreground animate-scale-in">
          Upplockat ✓
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      <Button 
        onClick={handleClaim}
        disabled={isLoading}
        className="flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        Ta över ärendet
      </Button>
      
      {isConflict && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 animate-slide-up">
          <p className="text-sm text-destructive">
            Redan plockad av annan säljare
          </p>
        </div>
      )}
    </div>
  );
};