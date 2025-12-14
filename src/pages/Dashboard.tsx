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
      
      <main className="p-2 md:p-6 space-y-2 md:space-y-6 max-w-7xl mx-auto pb-20 md:pb-6">
        {/* Welcome Section - Hidden on mobile */}
        <div className="animate-fade-in hidden md:block">
          <h1 className="text-2xl font-semibold tracking-tight">
            Välkommen tillbaka, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-base text-muted-foreground mt-1">
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

        {/* Conversion CTA - Desktop only */}
        <div className="hidden md:block">
          <ConversionCTA 
            currentResponseTime={metrics.averageResponseTime}
            potentialIncrease={12}
          />
        </div>

        {/* Mobile Quick Actions */}
        <div className="grid grid-cols-2 gap-2 md:hidden">
          <Button 
            onClick={() => navigate('/reports')}
            className="h-11 rounded-xl"
          >
            <BarChart3 className="h-4 w-4 mr-1.5" />
            Rapporter
          </Button>
          <Button 
            variant="secondary"
            onClick={() => navigate('/blocket/arenden')}
            className="h-11 rounded-xl"
          >
            <Flame className="h-4 w-4 mr-1.5" />
            Blocket
          </Button>
        </div>

        {/* Performance Section - Desktop only */}
        <Card className="hidden md:block rounded-2xl border border-border/50">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-lg font-semibold">Prestation</CardTitle>
                <CardDescription className="text-sm">Se din egna prestation och nyckeltal</CardDescription>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card 
                  className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate("/reports/conversion-rate")}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Konverteringsgrad</CardTitle>
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
                        <div className="text-3xl font-bold">{performanceKPIs.conversionRate.value}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Klicka för detaljer →</p>
                      </div>
                      <div className="w-24 h-12">
                        <SparklineChart data={performanceKPIs.conversionRate.sparkline} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate("/reports/total-leads")}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <CardTitle className="text-sm font-medium text-muted-foreground">Totala Leads</CardTitle>
                      </div>
                      <Badge variant="secondary" className="rounded-full gap-1 text-xs">
                        <ArrowUpIcon className="h-3 w-3 text-success" />
                        <span className="text-success">{Math.abs(performanceKPIs.totalLeads.change)}%</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-3xl font-bold">{performanceKPIs.totalLeads.value.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Klicka för detaljer →</p>
                      </div>
                      <div className="w-24 h-12">
                        <SparklineChart data={performanceKPIs.totalLeads.sparkline} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => navigate('/reports')}
                className="rounded-xl h-10"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Rapporter
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                Test-lead
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
