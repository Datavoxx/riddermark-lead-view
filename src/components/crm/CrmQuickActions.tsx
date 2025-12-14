import { Button } from '@/components/ui/button';
import { TrendingUp, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { CrmStatus, CrmStage } from '@/types/crm';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface CrmQuickActionsProps {
  leadId: string;
  currentStatus: CrmStatus;
  onStatusChange: (status: CrmStatus, stage?: CrmStage) => Promise<boolean>;
}

export function CrmQuickActions({ leadId, currentStatus, onStatusChange }: CrmQuickActionsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (status: CrmStatus, stage?: CrmStage) => {
    setIsLoading(status);
    await onStatusChange(status, stage);
    setIsLoading(null);
  };

  if (currentStatus === 'completed' || currentStatus === 'lost') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus === 'new_callback' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20"
              disabled={isLoading !== null}
            >
              {isLoading === 'in_progress' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Pågående</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Välj affärssteg</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('in_progress', 'negotiation')}>
              🟡 Förhandling
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('in_progress', 'test_drive')}>
              🔵 Provkörning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('in_progress', 'agreement')}>
              🟢 Avtal på gång
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {currentStatus === 'in_progress' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20"
              disabled={isLoading !== null}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ändra steg</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ändra affärssteg</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('in_progress', 'negotiation')}>
              🟡 Förhandling
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('in_progress', 'test_drive')}>
              🔵 Provkörning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('in_progress', 'agreement')}>
              🟢 Avtal på gång
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20"
        onClick={() => handleAction('completed')}
        disabled={isLoading !== null}
      >
        {isLoading === 'completed' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">Färdig</span>
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
        onClick={() => handleAction('lost')}
        disabled={isLoading !== null}
      >
        {isLoading === 'lost' ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <XCircle className="h-3.5 w-3.5" />
        )}
        <span className="hidden sm:inline">Förlorad</span>
      </Button>
    </div>
  );
}
