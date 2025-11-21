import { TopBar } from "@/components/TopBar";

export default function Wayke() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Wayke" />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-6">Wayke</h1>
        <p className="text-muted-foreground">Wayke innehåll kommer här...</p>
      </div>
    </div>
  );
}
