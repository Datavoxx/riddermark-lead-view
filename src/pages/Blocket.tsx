import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TopBar } from "@/components/TopBar";
import { Archive, ArrowRight } from "lucide-react";

export default function Blocket() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Blocket" />
      
      <main className="p-6">
        <div className="max-w-md mx-auto">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/blocket/arenden')}
          >
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Archive className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                Ärenden
                <ArrowRight className="h-4 w-4" />
              </CardTitle>
              <CardDescription>
                Hantera och ta över leads från Blocket
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Klicka här för att se alla tillgängliga ärenden och ta över dem
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}