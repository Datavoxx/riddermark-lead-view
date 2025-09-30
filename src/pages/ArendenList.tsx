import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/types/lead";
import { Search, Plus, FileX } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const statusFilters = [
  { key: 'all', label: 'Alla' },
  { key: 'unclaimed', label: 'Obevakade' },
  { key: 'claimed', label: 'Upplockade' },
];

export default function ArendenList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams({
        order: 'created_at.desc',
        limit: '100'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (debouncedSearchQuery.trim()) {
        params.append('q', debouncedSearchQuery.trim());
      }

      const response = await fetch(`https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta ärenden. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, debouncedSearchQuery]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          console.log('Leads updated, refetching...');
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, debouncedSearchQuery]);

  const handleClaim = async (leadId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ leadId }),
      });

      if (response.status === 200) {
        toast({
          title: "Ärendet upplockat",
          description: "Du har tagit över ärendet framgångsrikt.",
        });
        fetchLeads(); // Refresh the list
      } else if (response.status === 409) {
        toast({
          title: "Redan plockad",
          description: "Ärendet har redan plockats av en annan säljare.",
          variant: "destructive",
        });
        fetchLeads(); // Refresh to show updated status
      } else {
        throw new Error('Failed to claim lead');
      }
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte ta över ärendet. Försök igen.",
        variant: "destructive",
      });
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "< 1h sedan";
    if (diffInHours < 24) return `${diffInHours}h sedan`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d sedan`;
  };

  const handleLeadCreated = () => {
    setShowCreateDialog(false);
    fetchLeads();
  };

  const filteredLeads = useMemo(() => {
    return leads;
  }, [leads]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Ärenden" />
      
      <main className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant={statusFilter === filter.key ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setStatusFilter(filter.key)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Skapa test-lead
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Sök på ämne, namn, e-post eller regnummer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Inga ärenden hittades</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery.trim() 
                  ? "Försök med andra söktermer eller ta bort filtret."
                  : "Det finns inga ärenden att visa just nu."
                }
              </p>
              {!searchQuery.trim() && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  Skapa ett test-lead
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                          className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer"
                        >
                          {lead.subject}
                        </button>
                        <Badge 
                          variant={lead.claimed ? "default" : "destructive"}
                          className={lead.claimed ? "bg-success text-success-foreground" : ""}
                        >
                          {lead.claimed ? "Upplockad ✓" : "Obevakad"}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div><strong>Namn/Email:</strong> {lead.lead_namn}, {lead.lead_email}</div>
                        <div><strong>Reg.nr:</strong> {lead.regnr}</div>
                        <div><strong>Skapad:</strong> {formatRelativeTime(lead.created_at)}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="sm"
                        variant={lead.claimed ? "secondary" : "default"}
                        disabled={lead.claimed}
                        onClick={() => handleClaim(lead.id)}
                      >
                        {lead.claimed ? "Upplockat" : "Ta över"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showCreateDialog && (
        <CreateTestLeadForm onLeadCreated={handleLeadCreated} />
      )}
    </div>
  );
}