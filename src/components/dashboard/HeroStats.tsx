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
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {/* Active Leads */}
      <Card className="relative overflow-hidden rounded-xl md:rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-2.5 md:p-6">
        <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <div className="p-1 md:p-2 rounded-lg md:rounded-xl bg-primary/20">
              <Flame className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
            <span className="text-[10px] md:text-sm font-medium text-muted-foreground hidden sm:inline">Aktiva leads</span>
          </div>
          <div className="text-xl md:text-4xl font-bold tracking-tight">
            {isLoading ? <Loader2 className="h-5 w-5 md:h-8 md:w-8 animate-spin" /> : activeLeads}
          </div>
          <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
            <span className="hidden sm:inline">Obesvarade</span>
            <span className="sm:hidden">Aktiva</span>
          </p>
        </div>
      </Card>

      {/* Average Response Time */}
      <Card className="relative overflow-hidden rounded-xl md:rounded-2xl border-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-2.5 md:p-6">
        <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-success/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <div className="p-1 md:p-2 rounded-lg md:rounded-xl bg-success/20">
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-success" />
            </div>
            <span className="text-[10px] md:text-sm font-medium text-muted-foreground hidden sm:inline">Svarstid</span>
          </div>
          <div className="text-xl md:text-4xl font-bold tracking-tight">
            {isLoading ? <Loader2 className="h-5 w-5 md:h-8 md:w-8 animate-spin" /> : avgResponseTime}
          </div>
          <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
            <span className="hidden sm:inline">Senaste 24h</span>
            <span className="sm:hidden">Snitt</span>
          </p>
        </div>
      </Card>

      {/* Potential Business Volume */}
      <Card className="relative overflow-hidden rounded-xl md:rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent p-2.5 md:p-6">
        <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
            <div className="p-1 md:p-2 rounded-lg md:rounded-xl bg-primary/20">
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
            <span className="text-[10px] md:text-sm font-medium text-muted-foreground hidden sm:inline">Volym</span>
          </div>
          <div className="text-xl md:text-4xl font-bold tracking-tight">
            {isLoading ? (
              <Loader2 className="h-5 w-5 md:h-8 md:w-8 animate-spin" />
            ) : (
              <>{(potentialVolume / 1000).toFixed(0)}<span className="text-xs md:text-lg font-normal">k</span></>
            )}
          </div>
          <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5">
            <span className="hidden sm:inline">Potentiell kr</span>
            <span className="sm:hidden">kr</span>
          </p>
        </div>
      </Card>
    </div>
  );
}
