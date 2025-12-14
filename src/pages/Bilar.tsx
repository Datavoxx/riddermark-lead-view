import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Car } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Car = {
  id: string;
  marke_modell: string;
  arsmodell: number;
  regnr: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export default function Bilar() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState({
    marke_modell: "",
    arsmodell: new Date().getFullYear(),
    regnr: "",
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Kunde inte hämta bilar");
      console.error(error);
      return;
    }

    setCars(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("Du måste vara inloggad");
      return;
    }

    if (editingCar) {
      const { error } = await supabase
        .from("cars")
        .update(formData)
        .eq("id", editingCar.id);

      if (error) {
        toast.error("Kunde inte uppdatera bil");
        console.error(error);
        return;
      }

      toast.success("Bil uppdaterad");
    } else {
      const { error } = await supabase
        .from("cars")
        .insert([{ ...formData, user_id: user.id }]);

      if (error) {
        toast.error("Kunde inte lägga till bil");
        console.error(error);
        return;
      }

      toast.success("Bil tillagd");
    }

    setIsDialogOpen(false);
    setEditingCar(null);
    setFormData({
      marke_modell: "",
      arsmodell: new Date().getFullYear(),
      regnr: "",
    });
    fetchCars();
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      marke_modell: car.marke_modell,
      arsmodell: car.arsmodell,
      regnr: car.regnr,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna bil?")) return;

    const { error } = await supabase.from("cars").delete().eq("id", id);

    if (error) {
      toast.error("Kunde inte ta bort bil");
      console.error(error);
      return;
    }

    toast.success("Bil borttagen");
    fetchCars();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCar(null);
    setFormData({
      marke_modell: "",
      arsmodell: new Date().getFullYear(),
      regnr: "",
    });
  };

  const filteredCars = cars.filter((car) => {
    const query = searchQuery.toLowerCase();
    return (
      car.marke_modell.toLowerCase().includes(query) ||
      car.arsmodell.toString().includes(query) ||
      car.regnr.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background p-3 md:p-8">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-semibold tracking-tight">Våra bilar</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-0.5 md:mt-1">Hantera företagets fordonsflotta</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()} className="rounded-xl w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Lägg till bil
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingCar ? "Redigera bil" : "Lägg till ny bil"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="marke_modell">Märke & Modell</Label>
                  <Input
                    id="marke_modell"
                    value={formData.marke_modell}
                    onChange={(e) =>
                      setFormData({ ...formData, marke_modell: e.target.value })
                    }
                    placeholder="t.ex. Volvo V90"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="arsmodell">Årsmodell</Label>
                  <Input
                    id="arsmodell"
                    type="number"
                    value={formData.arsmodell}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        arsmodell: parseInt(e.target.value),
                      })
                    }
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="regnr">Registreringsnummer</Label>
                  <Input
                    id="regnr"
                    value={formData.regnr}
                    onChange={(e) =>
                      setFormData({ ...formData, regnr: e.target.value.toUpperCase() })
                    }
                    placeholder="t.ex. ABC123"
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    className="rounded-xl"
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" className="rounded-xl">
                    {editingCar ? "Uppdatera" : "Lägg till"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Sök på märke, modell, årsmodell eller registreringsnummer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Mobile Card View */}
        {isMobile ? (
          <div className="space-y-3">
            {filteredCars.length === 0 ? (
              <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {cars.length === 0 
                    ? "Inga bilar ännu. Lägg till din första bil!"
                    : "Inga bilar matchar din sökning."}
                </p>
              </div>
            ) : (
              filteredCars.map((car) => (
                <div 
                  key={car.id} 
                  className="bg-card rounded-xl border border-border/50 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{car.marke_modell}</p>
                      <p className="text-sm text-muted-foreground">{car.arsmodell}</p>
                    </div>
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded-lg ml-2">
                      {car.regnr}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Tillagd {format(new Date(car.created_at), "d MMM yyyy", { locale: sv })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(car)}
                      className="flex-1 rounded-lg"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Redigera
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(car.id)}
                      className="rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Märke & Modell</TableHead>
                  <TableHead>Årsmodell</TableHead>
                  <TableHead>Registreringsnummer</TableHead>
                  <TableHead>Tillagd</TableHead>
                  <TableHead>Senast uppdaterad</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      {cars.length === 0 
                        ? "Inga bilar ännu. Lägg till din första bil!"
                        : "Inga bilar matchar din sökning."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-accent/50 transition-colors">
                      <TableCell className="font-medium">{car.marke_modell}</TableCell>
                      <TableCell>{car.arsmodell}</TableCell>
                      <TableCell className="font-mono">{car.regnr}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(car.created_at), "d MMM yyyy HH:mm", { locale: sv })}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(car.updated_at), "d MMM yyyy HH:mm", { locale: sv })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(car)}
                            className="rounded-xl hover:bg-accent/60"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(car.id)}
                            className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
