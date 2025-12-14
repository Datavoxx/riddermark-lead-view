import { Card } from "@/components/ui/card";
import { SparklineChart } from "@/components/SparklineChart";
import { Flame, Clock, TrendingUp, Loader2 } from "lucide-react";

interface HeroStatsProps {
  activeLeads: number;
  avgResponseTime: string;
  potentialVolume: number;
  isLoading: boolean;
}

export function HeroStats({ activeLeads, avgResponseTime, potentialVolume, isLoading }: HeroStatsProps) {
  // Simulated sparkline data
  const leadsSparkline = [3, 5, 4, 7, 6, 8, 5, 9, 7, activeLeads];
  const responseSparkline = [45, 38, 42, 35, 40, 32, 38, 30, 35, 28];
  const volumeSparkline = [150, 180, 165, 200, 185, 220, 195, 240, 210, potentialVolume / 1000];

  return (
    <div className="grid grid-cols-3 gap-1.5 md:gap-4">
      {/* Active Leads */}
      <Card className="relative overflow-hidden rounded-lg md:rounded-2xl border-0 bg-gradient-to-br from-primary/10 to-transparent p-2 md:p-6">
        <div className="flex items-center gap-1 mb-0.5 md:mb-2">
          <Flame className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          <span className="text-[8px] md:text-sm text-muted-foreground">Aktiva</span>
        </div>
        <div className="text-xl md:text-4xl font-bold">
          {isLoading ? <Loader2 className="h-4 w-4 md:h-8 md:w-8 animate-spin" /> : activeLeads}
        </div>
      </Card>

      {/* Average Response Time */}
      <Card className="relative overflow-hidden rounded-lg md:rounded-2xl border-0 bg-gradient-to-br from-success/10 to-transparent p-2 md:p-6">
        <div className="flex items-center gap-1 mb-0.5 md:mb-2">
          <Clock className="h-3 w-3 md:h-4 md:w-4 text-success" />
          <span className="text-[8px] md:text-sm text-muted-foreground">Svarstid</span>
        </div>
        <div className="text-xl md:text-4xl font-bold">
          {isLoading ? <Loader2 className="h-4 w-4 md:h-8 md:w-8 animate-spin" /> : avgResponseTime}
        </div>
      </Card>

      {/* Potential Business Volume */}
      <Card className="relative overflow-hidden rounded-lg md:rounded-2xl border-0 bg-gradient-to-br from-primary/10 to-transparent p-2 md:p-6">
        <div className="flex items-center gap-1 mb-0.5 md:mb-2">
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          <span className="text-[8px] md:text-sm text-muted-foreground">Volym</span>
        </div>
        <div className="text-xl md:text-4xl font-bold">
          {isLoading ? (
            <Loader2 className="h-4 w-4 md:h-8 md:w-8 animate-spin" />
          ) : (
            <>{(potentialVolume / 1000).toFixed(0)}<span className="text-[10px] md:text-lg">k</span></>
          )}
        </div>
      </Card>
    </div>
  );
}
