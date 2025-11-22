import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function AddCarToWorkshopDialog() {
  const [open, setOpen] = useState(false);
  const [workshopLocation, setWorkshopLocation] = useState("");
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCarId) {
      toast.error("Vänligen välj en bil");
      return;
    }


    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const { error } = await supabase
        .from('workshop_entries')
        .insert({
          car_id: selectedCarId,
          workshop_name: workshopLocation,
          workshop_address: workshopLocation,
          workshop_place_id: null,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Bil tillagd i verkstad");
      setOpen(false);
      setWorkshopLocation("");
      setSelectedCarId("");
    } catch (error) {
      console.error('Error adding car to workshop:', error);
      toast.error("Kunde inte lägga till bil i verkstad");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till bil i verkstad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Lägg till bil i verkstad</DialogTitle>
          <DialogDescription>
            Välj en bil och sök efter verkstad för att registrera ett verkstadsbesök.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="car">Bil</Label>
            <Select value={selectedCarId} onValueChange={setSelectedCarId} required>
              <SelectTrigger id="car">
                <SelectValue placeholder={carsLoading ? "Laddar bilar..." : "Välj bil"} />
              </SelectTrigger>
              <SelectContent>
                {cars?.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.marke_modell} - {car.regnr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workshop">Verkstad</Label>
            <Input
              id="workshop"
              placeholder="Ange verkstadsnamn och adress..."
              value={workshopLocation}
              onChange={(e) => setWorkshopLocation(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lägger till...
                </>
              ) : (
                "Lägg till"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
