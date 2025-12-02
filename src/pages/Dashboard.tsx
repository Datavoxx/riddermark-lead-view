import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardSimulation } from "@/hooks/useDashboardSimulation";
import { ArrowRight, Plus, Users, Clock, TrendingUp, BarChart3, Archive, Loader2, Store, User, Mail, Car, CheckCircle2, Target, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
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
      trend: "down" as "up" | "down"
    },
    totalLeads: {
      value: 1247,
      change: 12.5,
      trend: "up" as "up" | "down"
    }
  };

  const handleLeadCreated = () => {
    setShowCreateDialog(false);
    fetchAvailableCases();
  };

  const fetchAvailableCases = async () => {
    try {
      setLoadingLeads(true);
      console.log('Dashboard: Fetching unclaimed leads...');
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('claimed', false)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error('Dashboard: Error fetching leads:', error);
        throw error;
      }
      
      console.log('Dashboard: Received leads:', data?.length || 0, data);
      setAvailableLeads(data || []);
    } catch (error) {
      console.error('Error fetching available cases:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "< 1h sedan";
    if (diffInHours < 24) return `${diffInHours}h sedan`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d sedan`;
  };

  useEffect(() => {
    fetchAvailableCases();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Dashboard" />
      
      <main className="p-6 space-y-6">
        {/* Welcome Section - Modern & Minimal */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-semibold tracking-tight">
            Välkommen tillbaka, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Här är en översikt av dina leads och aktiviteter
          </p>
        </div>

        {/* Available Cases Section */}
        <Card className="rounded-2xl border border-border/50 shadow-sm animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Tillgängliga ärenden</CardTitle>
                <CardDescription>
                  Ärenden som väntar på att plockas upp
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/blocket/arenden')}
                variant="outline"
                className="rounded-xl flex items-center gap-2"
              >
                Visa alla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingLeads ? (
              <div className="grid gap-6 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="rounded-2xl border border-border/50 overflow-hidden">
                    <CardHeader className="pb-3">
                      <Skeleton className="h-5 w-3/4 mb-2 rounded-full" />
                      <Skeleton className="h-4 w-full rounded-full" />
                      <Skeleton className="h-3 w-1/2 mt-2 rounded-full" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-12 w-full rounded-xl" />
                      <Skeleton className="h-3 w-full rounded-full" />
                      <Skeleton className="h-3 w-2/3 rounded-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : availableLeads.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                  <Archive className="h-8 w-8 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground">Inga tillgängliga ärenden just nu</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {availableLeads.map((lead) => (
                  <Card 
                    key={lead.id}
                    className="group rounded-2xl border border-border/50 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1"
                    onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge 
                          variant="destructive"
                          className="rounded-full gap-1.5"
                        >
                          <Clock className="h-3 w-3" />
                          Obevakad
                        </Badge>
                        <Badge variant="outline" className="rounded-full gap-1 text-xs">
                          <Store className="h-3 w-3" />
                          Blocket
                        </Badge>
                      </div>
                      
                      <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {lead.subject}
                      </CardTitle>
                      
                      <CardDescription className="flex items-center gap-1.5 text-xs mt-1.5">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(lead.created_at)}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 pb-3 flex-1">
                      {lead.summering && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {lead.summering}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{lead.lead_namn}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Car className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="font-mono">{lead.regnr}</span>
                        </div>
                      </div>

                      {lead.preview_image_url && (
                        <div className="rounded-xl overflow-hidden border mt-3">
                          <img 
                            src={lead.preview_image_url} 
                            alt="Fordonsannons"
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Nya leads idag</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics.newLeadsToday}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? "Laddar..." : metrics.newLeadsChange + " från igår"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Upplockade</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics.claimedLeads}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? "Laddar..." : `${metrics.claimedPercentage}% av alla leads`}
              </p>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium">Svarstid medel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : metrics.averageResponseTime}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading ? "Laddar..." : metrics.responseTimeChange}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Section */}
        <Card className="rounded-2xl border border-border/50 shadow-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Prestation</CardTitle>
            <CardDescription>
              Se din egna prestation och nyckeltal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {performanceKPIs.conversionRate.value}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Klicka för att se detaljer →
                  </p>
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
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {performanceKPIs.totalLeads.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Klicka för att se detaljer →
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                onClick={() => navigate('/reports')}
                className="rounded-xl flex items-center gap-2 animate-slide-up font-medium h-10"
              >
                <BarChart3 className="h-4 w-4" />
                Se alla Rapporter
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setShowCreateDialog(true)}
                className="rounded-xl flex items-center gap-2 animate-slide-up font-medium h-10"
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