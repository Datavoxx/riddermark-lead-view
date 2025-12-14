import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ArrowRight, User, Car, Flame, ChevronRight } from "lucide-react";
import { Lead } from "@/types/lead";

interface PriorityLeadsProps {
  leads: Lead[];
  isLoading: boolean;
}

function getLeadUrgency(lead: Lead): { level: "critical" | "warning" | "hot"; label: string; icon: React.ReactNode } {
  const createdAt = new Date(lead.created_at);
  const now = new Date();
  const hoursOld = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  if (hoursOld < 0.25) { // < 15 min
    return { level: "hot", label: "Hot lead 🔥", icon: <Flame className="h-3 w-3" /> };
  } else if (hoursOld < 1) { // < 1 hour
    return { level: "critical", label: "Svar krävs < 15 min", icon: <AlertTriangle className="h-3 w-3" /> };
  } else {
    return { level: "warning", label: `${Math.floor(hoursOld)}h utan svar`, icon: <Clock className="h-3 w-3" /> };
  }
}

export function PriorityLeads({ leads, isLoading }: PriorityLeadsProps) {
  const navigate = useNavigate();
  
  // Filter to unclaimed leads and sort by oldest first (most urgent)
  // Show max 3 on mobile, 5 on desktop (handled via CSS)
  const priorityLeads = leads
    .filter(lead => !lead.claimed)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base font-semibold">Leads som kräver åtgärd</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (priorityLeads.length === 0) {
    return (
      <Card className="rounded-2xl border border-success/20 bg-success/5">
        <CardContent className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/20 mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-sm font-medium text-success">Alla leads är hanterade!</p>
          <p className="text-xs text-muted-foreground mt-1">Inga ärenden kräver omedelbar åtgärd</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl md:rounded-2xl border border-destructive/20 bg-destructive/5 animate-fade-in">
      <CardHeader className="p-3 md:pb-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-destructive/20">
              <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
            </div>
            <CardTitle className="text-sm md:text-base font-semibold">Kräver åtgärd</CardTitle>
          </div>
          <Badge variant="destructive" className="rounded-full text-xs">
            {priorityLeads.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-6 md:pt-0 space-y-1.5 md:space-y-2">
        {priorityLeads.map((lead, index) => {
          const urgency = getLeadUrgency(lead);
          return (
            <div 
              key={lead.id}
              onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
              className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl bg-background/80 hover:bg-background cursor-pointer transition-colors group ${index >= 3 ? 'hidden md:flex' : ''}`}
            >
              <div className="flex-shrink-0">
                {lead.preview_image_url ? (
                  <img 
                    src={lead.preview_image_url} 
                    alt="" 
                    className="h-8 w-8 md:h-10 md:w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Car className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {lead.subject}
                </p>
                <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                  <span className="text-[10px] md:text-xs text-muted-foreground truncate max-w-[80px] md:max-w-none">
                    {lead.lead_namn}
                  </span>
                  <span className="text-[10px] md:text-xs font-mono text-muted-foreground hidden sm:inline">{lead.regnr}</span>
                </div>
              </div>
              
              <Badge 
                variant={urgency.level === "hot" ? "default" : "destructive"}
                className={`rounded-full text-[9px] md:text-[10px] gap-0.5 md:gap-1 px-1.5 md:px-2 ${
                  urgency.level === "hot" ? "bg-orange-500 hover:bg-orange-600" : ""
                }`}
              >
                {urgency.icon}
                <span className="hidden sm:inline">{urgency.label}</span>
                <span className="sm:hidden">{urgency.level === "hot" ? "🔥" : "⏰"}</span>
              </Badge>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block" />
            </div>
          );
        })}
        
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full rounded-lg md:rounded-xl mt-1 md:mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 md:h-9 text-xs md:text-sm"
          onClick={() => navigate('/blocket/arenden')}
        >
          Visa alla
          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
