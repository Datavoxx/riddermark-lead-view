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
    <Card className="relative overflow-hidden rounded-lg md:rounded-2xl border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-2 md:p-6">
      <div className="absolute -right-8 -bottom-8 w-20 md:w-32 h-20 md:h-32 bg-primary/20 rounded-full blur-2xl" />
      <div className="absolute -left-4 -top-4 w-12 md:w-24 h-12 md:h-24 bg-accent/20 rounded-full blur-2xl" />
      
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
          <div className="p-1.5 md:p-2.5 rounded-md md:rounded-xl bg-primary/20 shrink-0">
            <Zap className="h-3 w-3 md:h-5 md:w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-sm text-muted-foreground truncate">
              <span className="font-semibold text-primary">10 min snabbare</span> = <span className="font-semibold text-primary">+{potentialIncrease}%</span>
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/reports/response-time')}
          size="sm"
          className="rounded-md md:rounded-xl gap-1 shrink-0 h-7 md:h-9 text-[10px] md:text-sm px-2 md:px-3"
        >
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden md:inline">Svarstidsrapport</span>
          <span className="md:hidden">Svarstid</span>
        </Button>
      </div>
    </Card>
  );
}
