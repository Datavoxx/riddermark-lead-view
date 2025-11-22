import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { Autocomplete } from "@react-google-maps/api";
import { toast } from "sonner";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function AddCarToWorkshopDialog() {
  const [open, setOpen] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [workshopLocation, setWorkshopLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoaded, loadError } = useGoogleMaps();

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
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      setSelectedPlace(place);
      setWorkshopLocation(place.formatted_address || place.name || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCarId) {
      toast.error("Vänligen välj en bil");
      return;
    }

    if (!selectedPlace) {
      toast.error("Vänligen välj en verkstad");
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
          workshop_name: selectedPlace.name || workshopLocation,
          workshop_address: selectedPlace.formatted_address || workshopLocation,
          workshop_place_id: selectedPlace.place_id,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Bil tillagd i verkstad");
      setOpen(false);
      setWorkshopLocation("");
      setSelectedPlace(null);
      setSelectedCarId("");
    } catch (error) {
      console.error('Error adding car to workshop:', error);
      toast.error("Kunde inte lägga till bil i verkstad");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      const style = document.createElement('style');
      style.textContent = `
        .pac-container {
          z-index: 9999 !important;
          background-color: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          margin-top: 0.25rem;
        }
        .pac-item {
          padding: 0.5rem 1rem;
          color: hsl(var(--popover-foreground));
          border-top: 1px solid hsl(var(--border));
        }
        .pac-item:hover {
          background-color: hsl(var(--accent));
        }
        .pac-item-query {
          color: hsl(var(--foreground));
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isLoaded]);

  // Log any Google Maps errors
  if (loadError) {
    console.error("Google Maps loadError:", loadError);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Lägg till bil i verkstad
          {loadError && " (utan autocomplete)"}
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
            {!isLoaded ? (
              <Input
                id="workshop"
                placeholder="Laddar Google Maps..."
                disabled
              />
            ) : loadError ? (
              <div className="space-y-2">
                <Input
                  id="workshop"
                  placeholder="Ange verkstadsnamn och adress..."
                  value={workshopLocation}
                  onChange={(e) => setWorkshopLocation(e.target.value)}
                  required
                />
                <p className="text-sm text-destructive">
                  Google Maps kunde inte laddas. Du kan fortfarande ange verkstad manuellt.
                </p>
              </div>
            ) : (
              <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                  types: ["establishment"],
                  fields: ["formatted_address", "name", "place_id", "geometry"],
                }}
              >
                <Input
                  id="workshop"
                  placeholder="Sök efter verkstad..."
                  value={workshopLocation}
                  onChange={(e) => setWorkshopLocation(e.target.value)}
                  required
                />
              </Autocomplete>
            )}
            {selectedPlace && (
              <p className="text-sm text-muted-foreground">
                {selectedPlace.name} - {selectedPlace.formatted_address}
              </p>
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
