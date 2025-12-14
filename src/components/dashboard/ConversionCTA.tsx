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
    <Card className="rounded-lg md:rounded-2xl border-0 bg-gradient-to-r from-primary/10 to-accent/10 p-2 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
          <Zap className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary flex-shrink-0" />
          <p className="text-[10px] md:text-sm text-muted-foreground truncate">
            <span className="font-medium text-primary">10 min snabbare</span> = <span className="font-medium text-primary">+{potentialIncrease}%</span> konv.
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/reports/response-time')}
          className="rounded-lg h-6 md:h-10 text-[10px] md:text-sm px-2 md:px-4 flex-shrink-0"
          size="sm"
        >
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
          <span className="hidden md:inline">Svarstidsrapport</span>
        </Button>
      </div>
    </Card>
  );
}
