import { TopBar } from "@/components/TopBar";

export default function IVerkstad() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="I verkstad" />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">I verkstad</h1>
        <div className="bg-card rounded-lg border p-6">
          <p className="text-muted-foreground">
            Här visas bilar som för närvarande är i verkstad.
          </p>
        </div>
      </div>
    </div>
  );
}
