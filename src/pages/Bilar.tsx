import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
};

export default function Bilar() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Våra bilar</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleDialogClose()}>
                <Plus className="mr-2 h-4 w-4" />
                Lägg till bil
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit">
                    {editingCar ? "Uppdatera" : "Lägg till"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Märke & Modell</TableHead>
                <TableHead>Årsmodell</TableHead>
                <TableHead>Registreringsnummer</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Inga bilar ännu. Lägg till din första bil!
                  </TableCell>
                </TableRow>
              ) : (
                cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell className="font-medium">{car.marke_modell}</TableCell>
                    <TableCell>{car.arsmodell}</TableCell>
                    <TableCell>{car.regnr}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(car)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(car.id)}
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
      </div>
    </div>
  );
}
