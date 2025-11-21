import { TopBar } from "@/components/TopBar";

export default function Bytbil() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Bytbil" />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-6">Bytbil</h1>
        <p className="text-muted-foreground">Bytbil innehåll kommer här...</p>
      </div>
    </div>
  );
}
