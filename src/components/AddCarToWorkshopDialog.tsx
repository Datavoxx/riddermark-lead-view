import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { Autocomplete } from "@react-google-maps/api";

export function AddCarToWorkshopDialog() {
  const [open, setOpen] = useState(false);
  const [workshopLocation, setWorkshopLocation] = useState("");
  const [manualWorkshopInput, setManualWorkshopInput] = useState("");
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  

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


  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const text = place.formatted_address || place.name || inputRef.current?.value || "";
      if (text) {
        setWorkshopLocation(text);
        setManualWorkshopInput(text);
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCarId) {
      toast.error("Vänligen välj en bil");
      return;
    }

    const finalWorkshopText = workshopLocation || manualWorkshopInput;

    if (!finalWorkshopText) {
      toast.error("Vänligen ange verkstad");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Du måste vara inloggad");
        return;
      }

      const place = autocomplete?.getPlace();

      const { data, error } = await supabase
        .from('workshop_entries')
        .insert({
          car_id: selectedCarId,
          workshop_name: place?.name || finalWorkshopText,
          workshop_address: place?.formatted_address || finalWorkshopText,
          workshop_place_id: place?.place_id || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error (workshop_entries):', error);
        toast.error(`Kunde inte lägga till bil i verkstad: ${error.message}`);
        return;
      }

      console.log('Workshop entry saved:', data);
      toast.success("Bil tillagd i verkstad");
      
      // Uppdatera listan
      queryClient.invalidateQueries({ queryKey: ['workshop-entries'] });
      
      setOpen(false);
      setWorkshopLocation("");
      setManualWorkshopInput("");
      setSelectedCarId("");
    } catch (error) {
      console.error('Error adding car to workshop:', error);
      toast.error("Kunde inte lägga till bil i verkstad");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog modal={false} open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till bil i verkstad
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
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
            {isLoaded ? (
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  types: ['establishment'],
                  fields: ['place_id', 'name', 'formatted_address'],
                }}
              >
                <Input
                  ref={inputRef}
                  id="workshop"
                  placeholder="Sök efter verkstad..."
                  onChange={(e) => setManualWorkshopInput(e.target.value)}
                  required
                />
              </Autocomplete>
            ) : (
              <Input
                id="workshop"
                placeholder="Laddar Google Maps..."
                disabled
              />
            )}
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
