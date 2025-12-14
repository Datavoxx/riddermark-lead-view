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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Active Leads */}
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 md:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/20">
                <Flame className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Aktiva leads</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold tracking-tight">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : activeLeads}
            </div>
            <p className="text-xs text-muted-foreground">Obesvarade just nu</p>
          </div>
          <div className="w-20 h-12 opacity-80">
            <SparklineChart data={leadsSparkline} color="hsl(var(--primary))" />
          </div>
        </div>
      </Card>

      {/* Average Response Time */}
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-success/10 via-success/5 to-transparent p-4 md:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-success/20">
                <Clock className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Snitt-svarstid</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold tracking-tight">
              {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : avgResponseTime}
            </div>
            <p className="text-xs text-muted-foreground">Senaste 24h</p>
          </div>
          <div className="w-20 h-12 opacity-80">
            <SparklineChart data={responseSparkline} color="hsl(var(--success))" />
          </div>
        </div>
      </Card>

      {/* Potential Business Volume */}
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent p-4 md:p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Affärsvolym</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold tracking-tight">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <>{(potentialVolume / 1000).toFixed(0)}k<span className="text-lg font-normal ml-1">kr</span></>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Potentiell denna vecka</p>
          </div>
          <div className="w-20 h-12 opacity-80">
            <SparklineChart data={volumeSparkline} color="hsl(var(--primary))" />
          </div>
        </div>
      </Card>
    </div>
  );
}
