import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface EmailDraft {
  id: string;
  text: string;
  lead_id: string | null;
  status: string;
  correlation_id?: string | null;
  resume_url?: string | null;
}

export const EmailDraftModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [draftText, setDraftText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('email-drafts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_drafts',
          filter: `status=eq.pending,user_id=eq.${user.id}`
        },
        (payload) => {
          const newDraft = payload.new as EmailDraft;
          setDraft(newDraft);
          setDraftText(newDraft.text);
          setIsOpen(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const handleAction = async (action: 'send' | 'redo') => {
    if (!draft || !draft.resume_url) {
      toast.error("Ingen resume URL hittades");
      return;
    }

    setIsSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('draft-action', {
        body: {
          event: "DRAFT_ACTION",
          action,
          text: draftText,
          lead_id: draft.lead_id,
          draft_id: draft.id,
          correlation_id: draft.correlation_id,
          resume_url: draft.resume_url,
        },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to process action');
      }

      if (action === 'send') {
        setIsOpen(false);
        setDraft(null);
        setDraftText("");
        toast.success("Meddelandet skickat!");
      } else {
        toast.info("Begär nytt utkast...");
      }
    } catch (error) {
      console.error('Error processing draft action:', error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nytt e-postutkast</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="E-postmeddelande..."
            className="min-h-[200px] resize-none"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleAction('redo')}
            disabled={isSending}
          >
            Gör om
          </Button>
          <Button
            onClick={() => handleAction('send')}
            disabled={isSending}
          >
            Skicka
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
