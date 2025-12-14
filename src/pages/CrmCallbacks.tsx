import { TopBar } from '@/components/TopBar';
import { CrmLeadCard } from '@/components/crm/CrmLeadCard';
import { useCrmLeads } from '@/hooks/useCrmLeads';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PhoneCall, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function CrmCallbacks() {
  const navigate = useNavigate();
  const { leads, isLoading, updateLeadStatus } = useCrmLeads();
  const [search, setSearch] = useState('');

  const callbackLeads = leads
    .filter(l => l.crm_status === 'new_callback')
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

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Återkopplingar" />
      
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
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <PhoneCall className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nya återkopplingar</h1>
              <p className="text-sm text-muted-foreground">
                {callbackLeads.length} leads väntar på uppföljning
              </p>
            </div>
          </div>
        </div>

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
        ) : callbackLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {callbackLeads.map(lead => (
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
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <PhoneCall className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Alla återkopplingar hanterade!</h3>
                <p className="text-muted-foreground">
                  {search ? 'Inga matchande leads hittades' : 'Det finns inga leads som väntar på uppföljning'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
