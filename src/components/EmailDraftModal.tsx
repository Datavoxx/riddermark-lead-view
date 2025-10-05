import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EmailDraft {
  id: string;
  text: string;
  lead_id: string | null;
  correlation_id?: string | null;
}

interface EmailDraftModalProps {
  resumeUrl: string;
  draft: EmailDraft | null;
  onClose: () => void;
}

export const EmailDraftModal = ({ resumeUrl, draft, onClose }: EmailDraftModalProps) => {
  const [draftText, setDraftText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (draft) {
      setDraftText(draft.text);
    }
  }, [draft]);

  const handleAction = async (action: 'send' | 'redo') => {
    if (!draft) return;

    setIsSending(true);

    try {
      const response = await fetch(resumeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: "DRAFT_ACTION",
          action,
          draft_id: draft.id,
          lead_id: draft.lead_id,
          correlation_id: draft.correlation_id || null,
          text: draftText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process action');
      }

      if (action === 'send') {
        onClose();
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
    <Dialog open={!!draft} onOpenChange={() => {}}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg rounded-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
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
            className="min-h-[240px] w-full resize-none"
          />
        </div>

          <DialogFooter className="gap-2 sm:gap-0 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => handleAction('redo')}
              disabled={isSending}
            >
              {isSending ? 'Skickar...' : 'Gör om'}
            </Button>
            <Button
              onClick={() => handleAction('send')}
              disabled={isSending}
            >
              {isSending ? 'Skickar...' : 'Skicka'}
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};
