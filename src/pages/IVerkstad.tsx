import { TopBar } from "@/components/TopBar";
import { AddCarToWorkshopDialog } from "@/components/AddCarToWorkshopDialog";
import { WorkshopEntriesList } from "@/components/WorkshopEntriesList";

export default function IVerkstad() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Verkstad" />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Verkstad</h1>
            <p className="text-muted-foreground mt-1">Hantera bilar som är på verkstad</p>
          </div>
          <AddCarToWorkshopDialog />
        </div>
        <WorkshopEntriesList />
      </div>
    </div>
  );
}
