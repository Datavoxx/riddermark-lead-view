import { TopBar } from '@/components/TopBar';
import { CrmLeadCard } from '@/components/crm/CrmLeadCard';
import { useCrmLeads } from '@/hooks/useCrmLeads';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrmStage } from '@/types/crm';

export default function CrmInProgress() {
  const navigate = useNavigate();
  const { leads, isLoading, updateLeadStatus } = useCrmLeads();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | CrmStage>('all');

  const inProgressLeads = leads
    .filter(l => l.crm_status === 'in_progress')
    .filter(l => {
      if (stageFilter !== 'all' && l.crm_stage !== stageFilter) return false;
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        l.lead_namn?.toLowerCase().includes(searchLower) ||
        l.lead_email?.toLowerCase().includes(searchLower) ||
        l.regnr?.toLowerCase().includes(searchLower) ||
        l.preview_title?.toLowerCase().includes(searchLower)
      );
    });

  const stageCounts = {
    all: leads.filter(l => l.crm_status === 'in_progress').length,
    negotiation: leads.filter(l => l.crm_status === 'in_progress' && l.crm_stage === 'negotiation').length,
    test_drive: leads.filter(l => l.crm_status === 'in_progress' && l.crm_stage === 'test_drive').length,
    agreement: leads.filter(l => l.crm_status === 'in_progress' && l.crm_stage === 'agreement').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Pågående affärer" />
      
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/crm')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pågående affärer</h1>
              <p className="text-sm text-muted-foreground">
                {inProgressLeads.length} affärer under bearbetning
              </p>
            </div>
          </div>
        </div>

        {/* Stage Tabs */}
        <Tabs value={stageFilter} onValueChange={(v) => setStageFilter(v as typeof stageFilter)}>
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="all" className="gap-1">
              Alla <span className="text-xs opacity-70">({stageCounts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="negotiation" className="gap-1">
              🟡 Förhandling <span className="text-xs opacity-70">({stageCounts.negotiation})</span>
            </TabsTrigger>
            <TabsTrigger value="test_drive" className="gap-1">
              🔵 Provkörning <span className="text-xs opacity-70">({stageCounts.test_drive})</span>
            </TabsTrigger>
            <TabsTrigger value="agreement" className="gap-1">
              🟢 Avtal <span className="text-xs opacity-70">({stageCounts.agreement})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök på namn, e-post, regnr..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lead List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : inProgressLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressLeads.map(lead => (
              <CrmLeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={updateLeadStatus}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Inga pågående affärer</h3>
                <p className="text-muted-foreground">
                  {search ? 'Inga matchande affärer hittades' : 'Det finns inga pågående affärer just nu'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
