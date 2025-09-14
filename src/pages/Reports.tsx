import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Rapporter" />
      
      <main className="p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Rapporter</CardTitle>
            <CardDescription>
              Rapportfunktionen kommer snart
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Här kommer du kunna se detaljerade rapporter om dina leads och prestanda.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}