import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UpdateWorkshopStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: {
    id: string;
    status: string;
    notes: string | null;
    car_id: string;
  };
}

const statusOptions = [
  { value: "in_workshop", label: "I verkstad" },
  { value: "in_progress", label: "Pågående arbete" },
  { value: "waiting_for_parts", label: "Väntar på del" },
  { value: "completed", label: "Klar" },
  { value: "picked_up", label: "Uthämtad" },
  { value: "relocated", label: "Flyttad" },
];

export function UpdateWorkshopStatusDialog({
  open,
  onOpenChange,
  entry,
}: UpdateWorkshopStatusDialogProps) {
  const [status, setStatus] = useState(entry.status);
  const [notes, setNotes] = useState(entry.notes || "");
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updateData: any = {
        status,
        notes,
        updated_at: new Date().toISOString(),
      };

      // Sätt checked_out_at om status är "picked_up" eller "relocated"
      if (status === "picked_up" || status === "relocated") {
        updateData.checked_out_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("workshop_entries")
        .update(updateData)
        .eq("id", entry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-entries"] });
      toast.success("Status uppdaterad");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("Kunde inte uppdatera status");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uppdatera verkstadsstatus</DialogTitle>
          <DialogDescription>
            Ändra status och lägg till anteckningar för bilen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Anteckningar</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Lägg till anteckningar här..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Spara
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
