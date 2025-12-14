import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ChevronRight, Car, Flame, CheckCircle } from "lucide-react";
import { Lead } from "@/types/lead";

interface PriorityLeadsProps {
  leads: Lead[];
  isLoading: boolean;
}

function getLeadUrgency(lead: Lead) {
  const createdAt = new Date(lead.created_at);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
  
  if (minutesAgo < 15) {
    return { level: "hot", label: "Nu", color: "text-orange-500" };
  } else if (minutesAgo < 60) {
    return { level: "critical", label: `${minutesAgo}m`, color: "text-warning" };
  }
  return { level: "warning", label: `${Math.floor(minutesAgo / 60)}h`, color: "text-muted-foreground" };
}

export function PriorityLeads({ leads, isLoading }: PriorityLeadsProps) {
  const navigate = useNavigate();
  
  // Filter to unclaimed leads and sort by newest first
  const priorityLeads = leads
    .filter(lead => !lead.claimed)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  if (isLoading) {
    return (
      <Card className="rounded-xl md:rounded-2xl border border-warning/30">
        <CardContent className="p-3 md:p-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (priorityLeads.length === 0) {
    return (
      <Card className="rounded-xl md:rounded-2xl border border-success/30 bg-success/5">
        <CardContent className="p-3 md:p-6 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
          <span className="text-sm font-medium">Alla leads hanterade</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl md:rounded-2xl border border-warning/30 bg-gradient-to-r from-warning/5 to-transparent">
      <CardContent className="p-3 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold">Kräver åtgärd</span>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {priorityLeads.length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => navigate('/blocket/arenden')}
          >
            Alla
            <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
        
        {/* Lead list - show 2 on mobile, 3 on desktop */}
        <div className="space-y-1.5 md:space-y-2">
          {priorityLeads.map((lead, index) => {
            const urgency = getLeadUrgency(lead);
            const isHot = urgency.level === "hot";
            
            return (
              <div 
                key={lead.id}
                onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg bg-card/80 hover:bg-card cursor-pointer transition-colors ${index >= 2 ? 'hidden md:flex' : ''}`}
              >
                {/* Image */}
                <div className="flex-shrink-0">
                  {lead.preview_image_url ? (
                    <img 
                      src={lead.preview_image_url} 
                      alt="" 
                      className="h-9 w-9 md:h-11 md:w-11 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 md:h-11 md:w-11 rounded-lg bg-muted flex items-center justify-center">
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lead.subject || 'Nytt ärende'}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.lead_namn || 'Okänd'}</p>
                </div>
                
                {/* Urgency indicator */}
                <div className={`flex items-center gap-1 flex-shrink-0 ${urgency.color}`}>
                  {isHot ? (
                    <Flame className="h-4 w-4" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span className="text-xs font-medium">{urgency.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
