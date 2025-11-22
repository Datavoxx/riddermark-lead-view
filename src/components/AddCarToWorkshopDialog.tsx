import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { toast } from "sonner";

const libraries: ("places")[] = ["places"];
const GOOGLE_MAPS_API_KEY = "AIzaSyCefaIPUKmFrVjsfjxRTFtzR7_bomiPkXY";

export function AddCarToWorkshopDialog() {
  const [open, setOpen] = useState(false);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [workshopLocation, setWorkshopLocation] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add logic to save car to workshop in database
    toast.success("Bil tillagd i verkstad");
    setOpen(false);
    setWorkshopLocation("");
    setSelectedPlace(null);
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

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
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workshop">Verkstad</Label>
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
            {selectedPlace && (
              <p className="text-sm text-muted-foreground">
                {selectedPlace.name} - {selectedPlace.formatted_address}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Avbryt
            </Button>
            <Button type="submit">Lägg till</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
