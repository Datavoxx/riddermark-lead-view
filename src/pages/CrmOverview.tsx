import { TopBar } from '@/components/TopBar';
import { CrmStatsCards } from '@/components/crm/CrmStatsCards';
import { CrmLeadCard } from '@/components/crm/CrmLeadCard';
import { useCrmLeads } from '@/hooks/useCrmLeads';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function CrmOverview() {
  const navigate = useNavigate();
  const { leads, stats, isLoading, updateLeadStatus } = useCrmLeads();

  // Get leads that need immediate attention
  const urgentLeads = leads
    .filter(l => l.crm_status === 'new_callback')
    .slice(0, 3);

  const recentInProgress = leads
    .filter(l => l.crm_status === 'in_progress')
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="CRM" />
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">CRM Översikt</h1>
            <p className="text-sm text-muted-foreground">
              Hantera dina affärer och uppföljningar
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <CrmStatsCards stats={stats} isLoading={isLoading} />

        {/* Two columns for urgent and in-progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Callbacks */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Kräver åtgärd</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => navigate('/crm/callbacks')}
              >
                Visa alla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : urgentLeads.length > 0 ? (
              <div className="space-y-3">
                {urgentLeads.map(lead => (
                  <CrmLeadCard
                    key={lead.id}
                    lead={lead}
                    onStatusChange={updateLeadStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Inga leads som kräver åtgärd! 🎉</p>
              </div>
            )}
          </Card>

          {/* In Progress */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-lg font-semibold">Pågående affärer</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => navigate('/crm/in-progress')}
              >
                Visa alla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : recentInProgress.length > 0 ? (
              <div className="space-y-3">
                {recentInProgress.map(lead => (
                  <CrmLeadCard
                    key={lead.id}
                    lead={lead}
                    onStatusChange={updateLeadStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Inga pågående affärer</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
