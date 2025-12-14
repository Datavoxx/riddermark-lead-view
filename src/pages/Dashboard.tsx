import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { HeroStats } from "@/components/dashboard/HeroStats";
import { PriorityLeads } from "@/components/dashboard/PriorityLeads";
import { ConversionCTA } from "@/components/dashboard/ConversionCTA";
import { SparklineChart } from "@/components/SparklineChart";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardSimulation } from "@/hooks/useDashboardSimulation";
import { ArrowRight, Plus, Users, Clock, TrendingUp, BarChart3, Loader2, Target, ArrowUpIcon, ArrowDownIcon, AlertTriangle, Flame, ChevronRight } from "lucide-react";
import { Lead } from "@/types/lead";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const { metrics, isLoading } = useDashboardSimulation();

  const performanceKPIs = {
    conversionRate: {
      value: 24.8,
      change: -2.1,
      trend: "down" as "up" | "down",
      sparkline: [22, 24, 23, 26, 25, 24, 23, 25, 24.8]
    },
    totalLeads: {
      value: 1247,
      change: 12.5,
      trend: "up" as "up" | "down",
      sparkline: [980, 1050, 1100, 1080, 1150, 1180, 1200, 1230, 1247]
    }
  };

  const handleLeadCreated = () => {
    setShowCreateDialog(false);
    fetchAvailableCases();
  };

  const fetchAvailableCases = async () => {
    try {
      setLoadingLeads(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setAvailableLeads(data || []);
    } catch (error) {
      console.error('Error fetching available cases:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchAvailableCases();
  }, []);

  // Calculate stats from leads
  const activeLeadsCount = availableLeads.filter(l => !l.claimed).length;
  const potentialVolume = activeLeadsCount * 185000;
  
  // Get urgent unclaimed leads (less than 1 hour old)
  const urgentLeads = availableLeads
    .filter(l => !l.claimed)
    .filter(l => {
      const createdAt = new Date(l.created_at);
      const now = new Date();
      const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return hoursOld < 2;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Dashboard" />
      
      <main className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-24 md:pb-6 overflow-x-hidden">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-lg md:text-2xl font-semibold tracking-tight">
            Välkommen tillbaka, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-0.5 md:mt-1">
            Här är din dagliga översikt
          </p>
        </div>

        {/* Urgent Action Section */}
        {urgentLeads.length > 0 && (
          <Card className="border border-warning/40 bg-gradient-to-r from-warning/5 via-warning/3 to-transparent shadow-sm">
            <CardHeader className="p-2 md:p-6 pb-1.5 md:pb-3">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 md:gap-3">
                  <div className="p-1.5 md:p-2.5 bg-warning/15 rounded-md md:rounded-xl">
                    <AlertTriangle className="h-3 w-3 md:h-5 md:w-5 text-warning" />
                  </div>
                  <div>
                    <CardTitle className="text-xs md:text-lg font-semibold">Kräver handling</CardTitle>
                    <CardDescription className="text-[10px] md:text-sm">{urgentLeads.length} ärenden</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-md h-6 md:h-8 px-2 text-[10px] md:text-sm"
                  onClick={() => navigate('/blocket/arenden')}
                >
                  Alla
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-6 md:pt-0">
              <div className="space-y-1 md:space-y-2">
                {urgentLeads.map((lead) => {
                  const createdAt = new Date(lead.created_at);
                  const now = new Date();
                  const minutesAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
                  const timeLabel = minutesAgo < 60 ? `${minutesAgo}m` : `${Math.floor(minutesAgo / 60)}h`;
                  
                  return (
                    <div 
                      key={lead.id}
                      onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                      className="flex items-center justify-between p-1.5 md:p-3 rounded-md md:rounded-xl bg-card border border-border/50 hover:border-warning/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 md:gap-3 min-w-0 flex-1">
                        <div className="p-1 md:p-2 bg-primary/10 rounded-md shrink-0">
                          <Flame className="h-2.5 w-2.5 md:h-4 md:w-4 text-primary" />
                        </div>
                        <p className="font-medium text-[11px] md:text-sm truncate">{lead.subject || 'Nytt ärende'}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="secondary" className="rounded-full text-[9px] md:text-xs h-4 md:h-5 px-1.5">
                          {timeLabel}
                        </Badge>
                        <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hero Stats Section */}
        <HeroStats 
          activeLeads={activeLeadsCount}
          avgResponseTime={metrics.averageResponseTime}
          potentialVolume={potentialVolume}
          isLoading={isLoading || loadingLeads}
        />

        {/* Priority Leads Section */}
        <PriorityLeads 
          leads={availableLeads}
          isLoading={loadingLeads}
        />

        {/* Conversion CTA */}
        <ConversionCTA 
          currentResponseTime={metrics.averageResponseTime}
          potentialIncrease={12}
        />

        {/* KPI Cards with Sparklines */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          <Card className="rounded-xl md:rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1.5 md:pb-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-primary/10">
                  <TrendingUp className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
                </div>
                <CardTitle className="text-xs md:text-sm font-medium">Nya leads</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl md:text-3xl font-bold tracking-tight">
                    {isLoading ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : metrics.newLeadsToday}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {isLoading ? "..." : metrics.newLeadsChange + " från igår"}
                  </p>
                </div>
                <div className="w-12 md:w-20 h-6 md:h-10 hidden sm:block">
                  <SparklineChart data={[3, 5, 4, 6, 5, 7, 6, 8, metrics.newLeadsToday]} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl md:rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1.5 md:pb-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-primary/10">
                  <Users className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
                </div>
                <CardTitle className="text-xs md:text-sm font-medium">Upplockade</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl md:text-3xl font-bold tracking-tight">
                    {isLoading ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : metrics.claimedLeads}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {isLoading ? "..." : `${metrics.claimedPercentage}%`}
                  </p>
                </div>
                <div className="w-12 md:w-20 h-6 md:h-10 hidden sm:block">
                  <SparklineChart data={[4, 5, 6, 5, 7, 6, 8, 7, metrics.claimedLeads]} color="hsl(var(--success))" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-xl md:rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:p-6 pb-1.5 md:pb-2">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2.5 rounded-lg md:rounded-xl bg-primary/10">
                  <Clock className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
                </div>
                <CardTitle className="text-xs md:text-sm font-medium">Svarstid medel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl md:text-3xl font-bold tracking-tight">
                    {isLoading ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" /> : metrics.averageResponseTime}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">
                    {isLoading ? "..." : metrics.responseTimeChange}
                  </p>
                </div>
                <div className="w-16 md:w-20 h-8 md:h-10 hidden sm:block">
                  <SparklineChart data={[45, 42, 38, 40, 35, 38, 32, 35, 28]} color="hsl(var(--success))" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Section */}
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg font-semibold">Prestation</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Se din egna prestation och nyckeltal
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {/* Conversion Rate Card */}
              <Card 
                className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/reports/conversion-rate")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Konverteringsgrad
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="rounded-full gap-1 text-xs">
                      {performanceKPIs.conversionRate.trend === "up" ? (
                        <ArrowUpIcon className="h-3 w-3 text-success" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 text-destructive" />
                      )}
                      <span className={performanceKPIs.conversionRate.trend === "up" ? "text-success" : "text-destructive"}>
                        {Math.abs(performanceKPIs.conversionRate.change)}%
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold tracking-tight text-foreground">
                        {performanceKPIs.conversionRate.value}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Klicka för att se detaljer →
                      </p>
                    </div>
                    <div className="w-24 h-12 hidden sm:block">
                      <SparklineChart data={performanceKPIs.conversionRate.sparkline} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Leads Card */}
              <Card 
                className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                onClick={() => navigate("/reports/total-leads")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Totala Leads
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="rounded-full gap-1 text-xs">
                      {performanceKPIs.totalLeads.trend === "up" ? (
                        <ArrowUpIcon className="h-3 w-3 text-success" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 text-destructive" />
                      )}
                      <span className={performanceKPIs.totalLeads.trend === "up" ? "text-success" : "text-destructive"}>
                        {Math.abs(performanceKPIs.totalLeads.change)}%
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold tracking-tight text-foreground">
                        {performanceKPIs.totalLeads.value.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Klicka för att se detaljer →
                      </p>
                    </div>
                    <div className="w-24 h-12 hidden sm:block">
                      <SparklineChart data={performanceKPIs.totalLeads.sparkline} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={() => navigate('/reports')}
                className="rounded-xl flex items-center gap-2 font-medium h-10 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                Se alla Rapporter
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl flex items-center gap-2 font-medium h-10 text-sm"
              >
                <Plus className="h-4 w-4" />
                Skapa test-lead
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {showCreateDialog && (
        <CreateTestLeadForm onLeadCreated={handleLeadCreated} />
      )}
    </div>
  );
}
