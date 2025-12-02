import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  ChevronDown, 
  Trash2, 
  Maximize2,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.object({
  to: z.string().email({ message: 'Ange en giltig e-postadress' }),
  cc: z.string().email({ message: 'Ange en giltig e-postadress' }).optional().or(z.literal('')),
  bcc: z.string().email({ message: 'Ange en giltig e-postadress' }).optional().or(z.literal('')),
  subject: z.string().min(1, { message: 'Ämne krävs' }).max(200, { message: 'Ämne får max vara 200 tecken' }),
  body: z.string().min(1, { message: 'Meddelande krävs' }).max(10000, { message: 'Meddelande får max vara 10000 tecken' }),
});

interface ComposeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComposeEmailModal({ open, onOpenChange }: ComposeEmailModalProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setShowCc(false);
    setShowBcc(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleDiscard = () => {
    if (to || subject || body) {
      if (confirm('Är du säker på att du vill ta bort utkastet?')) {
        handleClose();
        toast.success('Utkast borttaget');
      }
    } else {
      handleClose();
    }
  };

  const handleSend = async () => {
    setErrors({});
    
    const result = emailSchema.safeParse({ to, cc, bcc, subject, body });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    
    // Simulate sending - replace with actual email sending logic
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('E-post skickat!');
      handleClose();
    } catch (error) {
      toast.error('Kunde inte skicka e-post');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 gap-0 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <DialogTitle className="text-lg font-semibold">Nytt meddelande</DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDiscard}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar with Send button */}
        <div className="px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSend}
              disabled={sending}
              className={cn(
                "h-10 px-5 rounded-l-xl rounded-r-none",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "shadow-lg shadow-primary/25",
                "transition-all duration-200",
                "font-medium"
              )}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Skickar...' : 'Skicka'}
            </Button>
            <Button
              variant="default"
              size="icon"
              className={cn(
                "h-10 w-9 rounded-l-none rounded-r-xl",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90",
                "shadow-lg shadow-primary/25",
                "border-l border-primary-foreground/20",
                "transition-all duration-200"
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Email form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* To field */}
          <div className="flex items-center border-b px-4">
            <span className="text-sm text-muted-foreground w-16 py-3">Till</span>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder=""
              className={cn(
                "flex-1 border-0 rounded-none focus-visible:ring-0 px-2 h-12",
                "bg-transparent",
                errors.to && "text-destructive"
              )}
            />
            <div className="flex items-center gap-2 text-sm">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="text-primary hover:underline"
                >
                  Kopia
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="text-primary hover:underline"
                >
                  Hemlig kopia
                </button>
              )}
            </div>
          </div>
          {errors.to && (
            <p className="text-xs text-destructive px-4 py-1 bg-destructive/5">{errors.to}</p>
          )}

          {/* CC field */}
          {showCc && (
            <>
              <div className="flex items-center border-b px-4">
                <span className="text-sm text-muted-foreground w-16 py-3">Kopia</span>
                <Input
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder=""
                  className={cn(
                    "flex-1 border-0 rounded-none focus-visible:ring-0 px-2 h-12",
                    "bg-transparent",
                    errors.cc && "text-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => { setShowCc(false); setCc(''); }}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {errors.cc && (
                <p className="text-xs text-destructive px-4 py-1 bg-destructive/5">{errors.cc}</p>
              )}
            </>
          )}

          {/* BCC field */}
          {showBcc && (
            <>
              <div className="flex items-center border-b px-4">
                <span className="text-sm text-muted-foreground w-16 py-3">Hemlig</span>
                <Input
                  type="email"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder=""
                  className={cn(
                    "flex-1 border-0 rounded-none focus-visible:ring-0 px-2 h-12",
                    "bg-transparent",
                    errors.bcc && "text-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => { setShowBcc(false); setBcc(''); }}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {errors.bcc && (
                <p className="text-xs text-destructive px-4 py-1 bg-destructive/5">{errors.bcc}</p>
              )}
            </>
          )}

          {/* Subject field */}
          <div className="border-b px-4">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Lägg till ett ämne"
              className={cn(
                "border-0 rounded-none focus-visible:ring-0 px-0 h-12",
                "bg-transparent text-base",
                "placeholder:text-muted-foreground",
                errors.subject && "text-destructive placeholder:text-destructive/50"
              )}
            />
          </div>
          {errors.subject && (
            <p className="text-xs text-destructive px-4 py-1 bg-destructive/5">{errors.subject}</p>
          )}

          {/* Body */}
          <div className="flex-1 p-4 overflow-auto">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Skriv ditt meddelande här..."
              className={cn(
                "w-full h-full min-h-[300px] border-0 resize-none",
                "focus-visible:ring-0",
                "bg-transparent text-base leading-relaxed",
                "placeholder:text-muted-foreground",
                errors.body && "text-destructive placeholder:text-destructive/50"
              )}
            />
          </div>
          {errors.body && (
            <p className="text-xs text-destructive px-4 py-1 bg-destructive/5 border-t">{errors.body}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
