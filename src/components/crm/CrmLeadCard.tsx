import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CrmLead, CrmStatus, CrmStage, SOURCE_CHANNEL_LABELS } from '@/types/crm';
import { CrmStatusBadge } from './CrmStatusBadge';
import { CrmQuickActions } from './CrmQuickActions';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { User, Car, Calendar, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrmLeadCardProps {
  lead: CrmLead;
  onStatusChange: (leadId: string, status: CrmStatus, stage?: CrmStage) => Promise<boolean>;
  showActions?: boolean;
  className?: string;
}

export function CrmLeadCard({ lead, onStatusChange, showActions = true, className }: CrmLeadCardProps) {
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

  return (
    <Card className={cn(
      'p-4 hover:shadow-md transition-all duration-200 border-border/50',
      className
    )}>
      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
            <Badge className={cn('text-xs', getChannelColor(lead.source_channel))}>
              {SOURCE_CHANNEL_LABELS[lead.source_channel || 'other']}
            </Badge>
          </div>
        </div>

        {/* Info row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {lead.regnr && (
            <div className="flex items-center gap-1.5">
              <Car className="h-4 w-4" />
              <span className="font-medium text-foreground">{lead.regnr}</span>
            </div>
          )}
          {lead.preview_title && (
            <span className="truncate max-w-[200px]">{lead.preview_title}</span>
          )}
        </div>

        {/* Status and meta row */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            <CrmStatusBadge status={lead.crm_status} stage={lead.crm_stage} />
            
            {lead.deal_value && (
              <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                <DollarSign className="h-3.5 w-3.5" />
                {lead.deal_value.toLocaleString('sv-SE')} kr
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

        {/* Actions row */}
        {showActions && (
          <div className="flex justify-end pt-2">
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
