import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
          )}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
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
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
