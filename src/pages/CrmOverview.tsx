import { TopBar } from '@/components/TopBar';
import { CrmStatsCards } from '@/components/crm/CrmStatsCards';
import { CrmLeadCard } from '@/components/crm/CrmLeadCard';
import { useCrmLeads } from '@/hooks/useCrmLeads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, AlertTriangle, TrendingUp } from 'lucide-react';
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
      
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg shadow-primary/10">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">CRM Översikt</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Hantera dina affärer och uppföljningar
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <CrmStatsCards stats={stats} isLoading={isLoading} />

        {/* Two columns for urgent and in-progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Callbacks */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-warning/5 to-transparent border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/15 rounded-xl">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Kräver åtgärd</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={() => navigate('/crm/callbacks')}
                >
                  Visa alla
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
                <div className="text-center py-10 text-muted-foreground">
                  <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-success" />
                  </div>
                  <p className="font-medium">Inga leads som kräver åtgärd!</p>
                  <p className="text-sm mt-1">Bra jobbat 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-info/5 to-transparent border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-info/15 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-info" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Pågående affärer</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                  onClick={() => navigate('/crm/in-progress')}
                >
                  Visa alla
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
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
                <div className="text-center py-10 text-muted-foreground">
                  <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Inga pågående affärer</p>
                  <p className="text-sm mt-1">Börja följa upp leads för att starta</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
