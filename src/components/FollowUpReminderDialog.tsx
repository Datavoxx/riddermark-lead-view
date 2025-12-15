import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CalendarClock, CalendarDays, Loader2, X } from "lucide-react";
import { format, addDays } from "date-fns";
import { sv } from "date-fns/locale";

interface FollowUpReminderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
  sentEmailText: string;
  originalMessage?: string;
}

export const FollowUpReminderDialog = ({
  isOpen,
  onClose,
  leadId,
  sentEmailText,
  originalMessage,
}: FollowUpReminderDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleSelectDays = async (days: number) => {
    const remindAt = addDays(new Date(), days);
    await createReminder(remindAt);
  };

  const handleSelectCustomDate = async () => {
    if (!selectedDate) {
      toast.error("Välj ett datum först");
      return;
    }
    await createReminder(selectedDate);
  };

  const createReminder = async (remindAt: Date) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const { error } = await supabase
        .from('follow_up_reminders')
        .insert({
          user_id: user.id,
          lead_id: leadId,
          remind_at: remindAt.toISOString(),
          sent_email_text: sentEmailText,
          original_message: originalMessage,
          status: 'pending',
        });

      if (error) {
        console.error('Error creating reminder:', error);
        toast.error("Kunde inte skapa påminnelse");
        return;
      }

      toast.success(`Påminnelse skapad för ${format(remindAt, 'd MMMM', { locale: sv })}`);
      onClose();
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.error("Något gick fel");
    } finally {
      setIsSubmitting(false);
      setShowCalendar(false);
      setSelectedDate(undefined);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-2xl gap-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/15 via-blue-500/10 to-blue-500/5 px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Skapa påminnelse</h2>
              <p className="text-sm text-muted-foreground">
                När vill du följa upp?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-muted-foreground mb-4">
            Välj när du vill bli påmind om att följa upp detta ärende.
          </p>

          {/* Quick select buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleSelectDays(2)}
              disabled={isSubmitting}
              className="rounded-xl h-16 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <span className="text-lg font-semibold">2</span>
              <span className="text-xs text-muted-foreground">dagar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSelectDays(3)}
              disabled={isSubmitting}
              className="rounded-xl h-16 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <span className="text-lg font-semibold">3</span>
              <span className="text-xs text-muted-foreground">dagar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSelectDays(4)}
              disabled={isSubmitting}
              className="rounded-xl h-16 flex flex-col items-center justify-center gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all"
            >
              <span className="text-lg font-semibold">4</span>
              <span className="text-xs text-muted-foreground">dagar</span>
            </Button>
          </div>

          {/* Custom date */}
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isSubmitting}
                className="w-full rounded-xl h-12 justify-start text-left font-normal hover:bg-primary/5 hover:border-primary/30 transition-all"
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "d MMMM yyyy", { locale: sv })
                ) : (
                  <span className="text-muted-foreground">Välj annat datum...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xl" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                locale={sv}
                initialFocus
                className="pointer-events-auto"
              />
              {selectedDate && (
                <div className="p-3 border-t border-border/50">
                  <Button
                    onClick={handleSelectCustomDate}
                    disabled={isSubmitting}
                    className="w-full rounded-xl"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Bekräfta
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="w-full rounded-xl h-10 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-2" />
            Hoppa över
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
