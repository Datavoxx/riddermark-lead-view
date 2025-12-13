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
import { ArrowRight, Plus, Users, Clock, TrendingUp, BarChart3, Loader2, Target, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
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
  const potentialVolume = activeLeadsCount * 185000; // Average car value estimation

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Dashboard" />
      
      <main className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight">
            Välkommen tillbaka, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Här är din dagliga översikt
          </p>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Nya leads idag</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics.newLeadsToday}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoading ? "Laddar..." : metrics.newLeadsChange + " från igår"}
                  </p>
                </div>
                <div className="w-20 h-10">
                  <SparklineChart data={[3, 5, 4, 6, 5, 7, 6, 8, metrics.newLeadsToday]} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Upplockade</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics.claimedLeads}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoading ? "Laddar..." : `${metrics.claimedPercentage}% av alla leads`}
                  </p>
                </div>
                <div className="w-20 h-10">
                  <SparklineChart data={[4, 5, 6, 5, 7, 6, 8, 7, metrics.claimedLeads]} color="hsl(var(--success))" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Svarstid medel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics.averageResponseTime}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isLoading ? "Laddar..." : metrics.responseTimeChange}
                  </p>
                </div>
                <div className="w-20 h-10">
                  <SparklineChart data={[45, 42, 38, 40, 35, 38, 32, 35, 28]} color="hsl(var(--success))" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Section */}
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Prestation</CardTitle>
            <CardDescription>
              Se din egna prestation och nyckeltal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="w-24 h-12">
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
                    <div className="w-24 h-12">
                      <SparklineChart data={performanceKPIs.totalLeads.sparkline} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                onClick={() => navigate('/reports')}
                className="rounded-xl flex items-center gap-2 font-medium h-10"
              >
                <BarChart3 className="h-4 w-4" />
                Se alla Rapporter
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl flex items-center gap-2 font-medium h-10"
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
