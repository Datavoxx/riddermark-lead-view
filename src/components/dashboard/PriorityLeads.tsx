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
      <Card className="rounded-lg md:rounded-2xl border border-destructive/20 bg-destructive/5">
        <CardContent className="p-2 md:p-6 space-y-1.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-background/50">
              <Skeleton className="h-6 w-6 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (priorityLeads.length === 0) {
    return (
      <Card className="rounded-lg md:rounded-2xl border border-success/20 bg-success/5">
        <CardContent className="py-4 md:py-8 text-center">
          <span className="text-lg md:text-2xl">✓</span>
          <p className="text-[10px] md:text-sm font-medium text-success mt-1">Alla leads hanterade!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg md:rounded-2xl border border-destructive/20 bg-destructive/5">
      <CardContent className="p-2 md:p-6">
        <div className="flex items-center justify-between mb-1.5 md:mb-3">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-destructive" />
            <span className="text-xs md:text-base font-semibold">Kräver åtgärd</span>
          </div>
          <Badge variant="destructive" className="h-5 px-1.5 text-[10px] md:text-xs">
            {priorityLeads.length}
          </Badge>
        </div>
        
        <div className="space-y-1 md:space-y-2">
          {priorityLeads.slice(0, 3).map((lead) => {
            const urgency = getLeadUrgency(lead);
            return (
              <div 
                key={lead.id}
                onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                className="flex items-center gap-1.5 md:gap-3 p-1.5 md:p-3 rounded-lg bg-background/80 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  {lead.preview_image_url ? (
                    <img src={lead.preview_image_url} alt="" className="h-6 w-6 md:h-10 md:w-10 rounded object-cover" />
                  ) : (
                    <div className="h-6 w-6 md:h-10 md:w-10 rounded bg-muted flex items-center justify-center">
                      <Car className="h-3 w-3 md:h-5 md:w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] md:text-sm font-medium truncate">{lead.subject}</p>
                  <p className="text-[9px] md:text-xs text-muted-foreground truncate">{lead.lead_namn}</p>
                </div>
                
                <Badge 
                  variant={urgency.level === "hot" ? "default" : "destructive"}
                  className={`text-[8px] md:text-[10px] h-4 md:h-5 px-1 ${urgency.level === "hot" ? "bg-orange-500" : ""}`}
                >
                  {urgency.level === "hot" ? "🔥" : "⏰"}
                </Badge>
              </div>
            );
          })}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-1.5 md:mt-2 h-7 md:h-10 text-[10px] md:text-sm text-destructive hover:text-destructive"
          onClick={() => navigate('/blocket/arenden')}
        >
          Visa alla <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
