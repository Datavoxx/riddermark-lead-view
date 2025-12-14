import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConversionCTAProps {
  currentResponseTime: string;
  potentialIncrease: number;
}

export function ConversionCTA({ currentResponseTime, potentialIncrease }: ConversionCTAProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="relative overflow-hidden rounded-xl md:rounded-2xl border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-3 md:p-6">
      <div className="absolute -right-8 -bottom-8 w-24 md:w-32 h-24 md:h-32 bg-primary/20 rounded-full blur-2xl" />
      <div className="absolute -left-4 -top-4 w-16 md:w-24 h-16 md:h-24 bg-accent/20 rounded-full blur-2xl" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-2 md:gap-3">
          <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-primary/20 shrink-0">
            <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm md:text-base text-foreground">Öka din konvertering</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Svara <span className="font-semibold text-primary">10 min snabbare</span> → <span className="font-semibold text-primary">+{potentialIncrease}%</span> konvertering
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/reports/response-time')}
          className="rounded-lg md:rounded-xl gap-1.5 shrink-0 h-8 md:h-10 text-xs md:text-sm"
          size="sm"
        >
          <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Se svarstidsrapport</span>
          <span className="sm:hidden">Svarstid</span>
          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Button>
      </div>
    </Card>
  );
}
