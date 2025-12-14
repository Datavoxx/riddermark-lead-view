import { TopBar } from '@/components/TopBar';
import { CrmLeadCard } from '@/components/crm/CrmLeadCard';
import { useCrmLeads } from '@/hooks/useCrmLeads';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Search, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

type TimeFilter = 'today' | 'week' | 'month' | 'all';

export default function CrmCompleted() {
  const navigate = useNavigate();
  const { leads, stats, isLoading, updateLeadStatus } = useCrmLeads();
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const completedLeads = leads
    .filter(l => l.crm_status === 'completed')
    .filter(l => {
      if (timeFilter === 'all') return true;
      if (!l.completed_at) return false;
      const completedDate = new Date(l.completed_at);
      switch (timeFilter) {
        case 'today':
          return completedDate >= todayStart;
        case 'week':
          return completedDate >= weekStart;
        case 'month':
          return completedDate >= monthStart;
        default:
          return true;
      }
    })
    .filter(l => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        l.lead_namn?.toLowerCase().includes(searchLower) ||
        l.lead_email?.toLowerCase().includes(searchLower) ||
        l.regnr?.toLowerCase().includes(searchLower) ||
        l.preview_title?.toLowerCase().includes(searchLower)
      );
    });

  const totalDealValue = completedLeads.reduce((sum, l) => sum + (l.deal_value || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Färdiga affärer" />
      
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 pb-24 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/crm')}
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold text-foreground">Färdiga affärer</h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {completedLeads.length} avslutade affärer
              </p>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="p-4 md:p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total volym ({timeFilter === 'all' ? 'alla tider' : timeFilter === 'today' ? 'idag' : timeFilter === 'week' ? 'vecka' : 'månad'})</p>
                <p className="text-xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalDealValue.toLocaleString('sv-SE')} kr
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs md:text-sm text-muted-foreground">Antal affärer</p>
              <p className="text-xl md:text-2xl font-bold">{completedLeads.length}</p>
            </div>
          </div>
        </Card>

        {/* Time Filter Tabs */}
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList className="grid w-full max-w-md grid-cols-4 h-auto">
            <TabsTrigger value="today" className="text-xs md:text-sm py-2 gap-1">
              Idag
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-xs hidden sm:inline-flex">
                {stats.completedToday}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs md:text-sm py-2 gap-1">
              Vecka
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-xs hidden sm:inline-flex">
                {stats.completedWeek}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="month" className="text-xs md:text-sm py-2 gap-1">
              Månad
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-xs hidden sm:inline-flex">
                {stats.completedMonth}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs md:text-sm py-2">
              Alla
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
        ) : completedLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedLeads.map(lead => (
              <CrmLeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={updateLeadStatus}
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Inga färdiga affärer</h3>
                <p className="text-muted-foreground">
                  {search ? 'Inga matchande affärer hittades' : 'Det finns inga avslutade affärer för denna period'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
