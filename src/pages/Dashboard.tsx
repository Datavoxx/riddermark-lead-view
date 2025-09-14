import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/TopBar";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { ArrowRight, Plus, Users, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleLeadCreated = () => {
    setShowCreateDialog(false);
    // Optionally show a success message or refresh data
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Dashboard" />
      
      <main className="p-6 space-y-6">
        {/* Welcome Section */}
        <Card>
          <CardHeader>
            <CardTitle>Välkommen tillbaka, {user?.email?.split('@')[0]}</CardTitle>
            <CardDescription>
              Här är en översikt av dina leads och aktiviteter
            </CardDescription>
          </CardHeader>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
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
          
          <Card>
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
          
          <Card>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Snabbstart</CardTitle>
            <CardDescription>
              Vanliga åtgärder för att komma igång
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => navigate('/blocket/arenden')}
                className="flex items-center gap-2"
              >
                Gå till Ärenden
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
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