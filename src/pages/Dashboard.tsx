import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/TopBar";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Plus, Users, Clock, TrendingUp, BarChart3, Archive } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [availableCases, setAvailableCases] = useState<number>(0);

  const handleLeadCreated = () => {
    setShowCreateDialog(false);
    fetchAvailableCases();
  };

  const fetchAvailableCases = async () => {
    try {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('claimed', false);
      
      if (error) throw error;
      setAvailableCases(count || 0);
    } catch (error) {
      console.error('Error fetching available cases:', error);
    }
  };

  useEffect(() => {
    fetchAvailableCases();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Dashboard" />
      
      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="animate-slide-up">Välkommen tillbaka, {user?.email?.split('@')[0]}</CardTitle>
            <CardDescription className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Här är en översikt av dina leads och aktiviteter
            </CardDescription>
          </CardHeader>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nya leads idag</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +20% från igår
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upplockade</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                67% av alla leads
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Svarstid medel</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">
                -15 min från igår
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Section */}
        <Card className="animate-fade-in hover:shadow-lg transition-all duration-200" style={{ animationDelay: "0.6s" }}>
          <CardHeader>
            <CardTitle>Prestation</CardTitle>
            <CardDescription>
              Se din egna prestation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Available Cases Display */}
            <div className="bg-muted/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Archive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{availableCases} tillgängliga ärenden</div>
                  <div className="text-sm text-muted-foreground">Redo att plockas upp</div>
                </div>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate('/blocket/arenden')}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Gå dit
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/reports')}
                className="flex items-center gap-2 animate-slide-up"
                style={{ animationDelay: "0.7s" }}
              >
                <BarChart3 className="h-4 w-4" />
                Se Rapporter
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2 animate-slide-up"
                style={{ animationDelay: "0.8s" }}
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