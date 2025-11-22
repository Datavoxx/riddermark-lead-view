import { TopBar } from "@/components/TopBar";
import { AddCarToWorkshopDialog } from "@/components/AddCarToWorkshopDialog";

export default function IVerkstad() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Verkstad" />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Verkstad</h1>
          <AddCarToWorkshopDialog />
        </div>
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">
            Här visas bilar som för närvarande är i verkstad.
          </p>
        </div>
      </div>
    </div>
  );
}
