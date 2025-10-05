import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailDraft {
  id: string;
  text: string;
  lead_id: string | null;
  status: string;
}

export const EmailDraftModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [draftText, setDraftText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('email-drafts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_drafts',
          filter: 'status=eq.pending'
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
  }, []);

  const handleAction = async (action: 'send' | 'redo') => {
    if (!draft) return;

    setIsSending(true);

    try {
      const response = await fetch('https://datavox.app.n8n.cloud/webhook/draft-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_id: draft.id,
          lead_id: draft.lead_id,
          action,
          text: draftText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process action');
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
