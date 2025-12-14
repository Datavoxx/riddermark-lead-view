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
    <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 md:p-6">
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
      <div className="absolute -left-4 -top-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 shrink-0">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Öka din konvertering</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Svarar du <span className="font-semibold text-primary">10 min snabbare</span> kan du öka konverteringen med upp till{" "}
              <span className="font-semibold text-primary">+{potentialIncrease}%</span>
            </p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate('/reports/response-time')}
          className="rounded-xl gap-2 shrink-0"
        >
          <TrendingUp className="h-4 w-4" />
          Se svarstidsrapport
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
