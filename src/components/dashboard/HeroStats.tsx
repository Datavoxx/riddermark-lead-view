import { Card } from "@/components/ui/card";
import { Flame, Clock, TrendingUp, Loader2 } from "lucide-react";

interface HeroStatsProps {
  activeLeads: number;
  avgResponseTime: string;
  potentialVolume: number;
  isLoading: boolean;
}

export function HeroStats({ activeLeads, avgResponseTime, potentialVolume, isLoading }: HeroStatsProps) {
  // Format response time for mobile (remove "h" if present, keep short)
  const mobileResponseTime = avgResponseTime.replace('h', '').trim();
  const volumeK = Math.round(potentialVolume / 1000);

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4">
      {/* Active Leads */}
      <Card className="rounded-xl md:rounded-2xl border-0 bg-gradient-to-br from-primary/10 to-transparent p-3 md:p-6">
        <div className="flex items-center gap-1.5 mb-1 md:mb-2">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-[10px] md:text-sm text-muted-foreground hidden md:inline">Aktiva leads</span>
        </div>
        <div className="text-2xl md:text-4xl font-bold">
          {isLoading ? <Loader2 className="h-5 w-5 md:h-8 md:w-8 animate-spin" /> : activeLeads}
        </div>
        <span className="text-[10px] text-muted-foreground md:hidden">Aktiva</span>
      </Card>

      {/* Average Response Time */}
      <Card className="rounded-xl md:rounded-2xl border-0 bg-gradient-to-br from-success/10 to-transparent p-3 md:p-6">
        <div className="flex items-center gap-1.5 mb-1 md:mb-2">
          <Clock className="h-4 w-4 text-success" />
          <span className="text-[10px] md:text-sm text-muted-foreground hidden md:inline">Svarstid</span>
        </div>
        <div className="text-2xl md:text-4xl font-bold truncate">
          {isLoading ? <Loader2 className="h-5 w-5 md:h-8 md:w-8 animate-spin" /> : (
            <>
              <span className="md:hidden">{mobileResponseTime}</span>
              <span className="hidden md:inline">{avgResponseTime}</span>
            </>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground md:hidden">Svarstid</span>
      </Card>

      {/* Potential Business Volume */}
      <Card className="rounded-xl md:rounded-2xl border-0 bg-gradient-to-br from-primary/10 to-transparent p-3 md:p-6">
        <div className="flex items-center gap-1.5 mb-1 md:mb-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-[10px] md:text-sm text-muted-foreground hidden md:inline">Volym</span>
        </div>
        <div className="text-2xl md:text-4xl font-bold">
          {isLoading ? (
            <Loader2 className="h-5 w-5 md:h-8 md:w-8 animate-spin" />
          ) : (
            <>{volumeK}<span className="text-sm md:text-lg">k</span></>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground md:hidden">Volym</span>
      </Card>
    </div>
  );
}
