import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ArrowRight, User, Car, Flame } from "lucide-react";
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
    <Card className="rounded-2xl border border-destructive/20 bg-destructive/5 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <CardTitle className="text-base font-semibold">Leads som kräver åtgärd</CardTitle>
          </div>
          <Badge variant="destructive" className="rounded-full">
            {priorityLeads.length} st
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {priorityLeads.map((lead) => {
          const urgency = getLeadUrgency(lead);
          return (
            <div 
              key={lead.id}
              onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
              className="flex items-center gap-3 p-3 rounded-xl bg-background/80 hover:bg-background cursor-pointer transition-colors group"
            >
              <div className="flex-shrink-0">
                {lead.preview_image_url ? (
                  <img 
                    src={lead.preview_image_url} 
                    alt="" 
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Car className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {lead.subject}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {lead.lead_namn}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-mono text-muted-foreground">{lead.regnr}</span>
                </div>
              </div>
              
              <Badge 
                variant={urgency.level === "hot" ? "default" : "destructive"}
                className={`rounded-full text-[10px] gap-1 ${
                  urgency.level === "hot" ? "bg-orange-500 hover:bg-orange-600" : ""
                }`}
              >
                {urgency.icon}
                {urgency.label}
              </Badge>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="rounded-lg h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/blocket/arenden/${lead.id}`);
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        
        <Button 
          variant="ghost" 
          className="w-full rounded-xl mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => navigate('/blocket/arenden')}
        >
          Visa alla ärenden
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
