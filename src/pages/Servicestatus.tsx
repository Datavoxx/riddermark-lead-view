import { TopBar } from "@/components/TopBar";

export default function Servicestatus() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Servicestatus" />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Servicestatus</h1>
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">
            Här visas servicestatus för alla bilar.
          </p>
        </div>
      </div>
    </div>
  );
}
