import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Send, RotateCcw, Loader2 } from "lucide-react";

interface EmailDraft {
  id: string;
  text: string;
  lead_id: string | null;
  status: string;
  correlation_id?: string | null;
  resume_url?: string | null;
}

export const EmailDraftModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [draftText, setDraftText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRedoing, setIsRedoing] = useState(false);

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
          console.log('📧 New email draft received:', payload.new);
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
    if (!draft || !draft.resume_url) {
      toast.error("Ingen resume URL hittades");
      return;
    }

    if (action === 'send') {
      setIsSending(true);
    } else {
      setIsRedoing(true);
    }

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
        toast.info("Genererar nytt utkast...");
      }
    } catch (error) {
      console.error('Error processing draft action:', error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsSending(false);
      setIsRedoing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI-genererat e-postutkast</h2>
              <p className="text-sm text-muted-foreground">
                Baserat på ditt röstmeddelande
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-5">
          <Textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="E-postmeddelande..."
            className="min-h-[220px] rounded-xl bg-muted/30 border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 resize-none text-base leading-relaxed"
          />
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-muted-foreground">
              Redigera texten vid behov innan du skickar
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {draftText.length} tecken
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50 flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleAction('redo')}
            disabled={isSending || isRedoing}
            className="flex-1 rounded-xl h-11 active:scale-[0.98] transition-all"
          >
            {isRedoing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Gör om
          </Button>
          <Button
            onClick={() => handleAction('send')}
            disabled={isSending || isRedoing || !draftText.trim()}
            className="flex-1 rounded-xl h-11 active:scale-[0.98] transition-all"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Skicka
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
