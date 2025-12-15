import { Card } from '@/components/ui/card';
import { CrmStats } from '@/types/crm';
import { Bell, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CrmStatsCardsProps {
  stats: CrmStats;
  isLoading?: boolean;
}

export function CrmStatsCards({ stats, isLoading }: CrmStatsCardsProps) {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Kräver åtgärd',
      value: stats.newCallbacks,
      icon: Bell,
      gradient: 'from-blue-500/20 to-blue-600/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      href: '/crm/callbacks',
      pulse: stats.newCallbacks > 0,
    },
    {
      title: 'Pågående affärer',
      value: stats.inProgress,
      icon: TrendingUp,
      gradient: 'from-amber-500/20 to-amber-600/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
      href: '/crm/in-progress',
    },
    {
      title: 'Färdiga affärer',
      subtitle: `Idag: ${stats.completedToday} • Vecka: ${stats.completedWeek} • Månad: ${stats.completedMonth}`,
      value: stats.completedMonth,
      icon: CheckCircle2,
      gradient: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      href: '/crm/completed',
    },
    {
      title: 'Försenade uppföljningar',
      value: stats.overdueFollowups,
      icon: AlertTriangle,
      gradient: 'from-red-500/20 to-red-600/20',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      href: '/crm/callbacks',
      warning: stats.overdueFollowups > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          onClick={() => navigate(card.href)}
          className={cn(
            'relative overflow-hidden p-5 cursor-pointer transition-all duration-300',
            'hover:shadow-lg hover:-translate-y-1',
            'border',
            card.borderColor
          )}
        >
          {/* Background gradient */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50',
            card.gradient
          )} />
          
          {/* Pulse animation for important items */}
          {card.pulse && (
            <div className="absolute top-3 right-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>
          )}
          
          {card.warning && (
            <div className="absolute top-3 right-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                'h-10 w-10 rounded-xl flex items-center justify-center',
                'bg-background/80 shadow-sm'
              )}>
                <card.icon className={cn('h-5 w-5', card.iconColor)} />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {isLoading ? '—' : card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
