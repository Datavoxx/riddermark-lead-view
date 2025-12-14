import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CrmLead, CrmStatus, CrmStage, SOURCE_CHANNEL_LABELS } from '@/types/crm';
import { CrmStatusBadge } from './CrmStatusBadge';
import { CrmQuickActions } from './CrmQuickActions';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { User, Car, Calendar, DollarSign, Phone, Mail, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CrmLeadCardProps {
  lead: CrmLead;
  onStatusChange: (leadId: string, status: CrmStatus, stage?: CrmStage) => Promise<boolean>;
  showActions?: boolean;
  className?: string;
}

export function CrmLeadCard({ lead, onStatusChange, showActions = true, className }: CrmLeadCardProps) {
  const navigate = useNavigate();
  
  const handleStatusChange = async (status: CrmStatus, stage?: CrmStage) => {
    return onStatusChange(lead.id, status, stage);
  };

  const getChannelColor = (channel: string | null) => {
    switch (channel) {
      case 'blocket':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'wayke':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'bytbil':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Determine border color based on status
  const getBorderColor = () => {
    switch (lead.crm_status) {
      case 'new_callback':
        return 'border-l-4 border-l-warning';
      case 'in_progress':
        return 'border-l-4 border-l-info';
      case 'completed':
        return 'border-l-4 border-l-success';
      default:
        return 'border-l-4 border-l-muted';
    }
  };

  return (
    <Card 
      className={cn(
        'group p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border-border/50 cursor-pointer',
        getBorderColor(),
        className
      )}
      onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
    >
      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-sm">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {lead.lead_namn || 'Okänd kund'}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {lead.lead_email || 'Ingen e-post'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {lead.deal_value && (
              <Badge className="bg-success/10 text-success border-0 font-bold text-sm px-2.5">
                {lead.deal_value.toLocaleString('sv-SE')} kr
              </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge className={cn('text-xs rounded-full', getChannelColor(lead.source_channel))}>
            {SOURCE_CHANNEL_LABELS[lead.source_channel || 'other']}
          </Badge>
          {lead.regnr && (
            <div className="flex items-center gap-1.5 font-mono">
              <Car className="h-3.5 w-3.5" />
              <span className="font-semibold text-foreground">{lead.regnr}</span>
            </div>
          )}
          {lead.preview_title && (
            <span className="truncate max-w-[200px] text-xs">{lead.preview_title}</span>
          )}
        </div>

        {/* Status and meta row */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-3">
            <CrmStatusBadge status={lead.crm_status} stage={lead.crm_stage} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {lead.last_activity_at ? (
              formatDistanceToNow(new Date(lead.last_activity_at), { 
                addSuffix: true, 
                locale: sv 
              })
            ) : (
              'Ingen aktivitet'
            )}
          </div>
        </div>

        {/* Actions row - Always visible with prominent buttons */}
        {showActions && (
          <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              className="flex-1 rounded-xl gap-1.5 h-9 font-medium shadow-sm"
            >
              <Phone className="h-3.5 w-3.5" />
              Ring
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 rounded-xl gap-1.5 h-9 font-medium"
            >
              <Mail className="h-3.5 w-3.5" />
              E-post
            </Button>
            <CrmQuickActions
              leadId={lead.id}
              currentStatus={lead.crm_status}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
