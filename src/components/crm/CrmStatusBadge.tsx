import { Badge } from '@/components/ui/badge';
import { CrmStatus, CrmStage, CRM_STATUS_LABELS, CRM_STAGE_LABELS } from '@/types/crm';
import { cn } from '@/lib/utils';

interface CrmStatusBadgeProps {
  status: CrmStatus;
  stage?: CrmStage;
  className?: string;
}

export function CrmStatusBadge({ status, stage, className }: CrmStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'new_callback':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStageStyles = () => {
    switch (stage) {
      case 'negotiation':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'test_drive':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'agreement':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return '';
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge 
        variant="outline" 
        className={cn('font-medium border', getStatusStyles())}
      >
        {CRM_STATUS_LABELS[status]}
      </Badge>
      {stage && (
        <Badge 
          variant="outline" 
          className={cn('font-medium border', getStageStyles())}
        >
          {CRM_STAGE_LABELS[stage]}
        </Badge>
      )}
    </div>
  );
}
