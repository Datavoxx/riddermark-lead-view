import { TopBar } from "@/components/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Link2, BarChart3, MessageSquare, TrendingUp, Zap, Clock, ArrowRight } from "lucide-react";

const upcomingFeatures = [
  {
    icon: BarChart3,
    title: "Analysera leads",
    description: "Se varifrån dina leads kommer och optimera din strategi"
  },
  {
    icon: MessageSquare,
    title: "Snabbsvar",
    description: "Svara direkt på leads från Datavox"
  },
  {
    icon: TrendingUp,
    title: "Prestandarapporter",
    description: "Jämför resultat med andra kanaler"
  }
];

export default function Wayke() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Wayke" />
      
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        {/* Empty State Hero */}
        <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
            <Car className="h-10 w-10 md:h-12 md:w-12 text-primary" />
          </div>
          
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 rounded-full text-sm font-medium">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Kommer snart
          </Badge>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Wayke Integration
          </h1>
          <p className="text-muted-foreground max-w-md mb-8 text-sm md:text-base leading-relaxed">
            Anslut ditt Wayke-konto för att hantera leads, synkronisera annonser och 
            få insikter direkt i Datavox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/25 font-medium">
              <Link2 className="h-4 w-4" />
              Anslut Wayke
            </Button>
            <Button size="lg" variant="outline" className="gap-2 rounded-xl font-medium">
              Läs mer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="mt-8 md:mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Kommande funktioner</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingFeatures.map((feature) => (
              <Card 
                key={feature.title} 
                className="group border-border/50 bg-card/50 hover:bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <CardContent className="p-5">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <Card className="mt-8 border-dashed border-2 border-border/60 bg-transparent">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                <Link2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Ingen integration aktiv</p>
                <p className="text-sm text-muted-foreground">Anslut Wayke för att komma igång</p>
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full">
              Inte ansluten
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}