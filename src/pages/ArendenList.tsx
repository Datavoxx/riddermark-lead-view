import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { CreateTestLeadForm } from "@/components/CreateTestLeadForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/types/lead";
import { 
  Search, Plus, FileX, Clock, User, Mail, 
  Phone, Car, Store, CheckCircle2, MapPin, 
  ArrowRight, ChevronRight 
} from "lucide-react";
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
  const [newLeadIds, setNewLeadIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchLeads = async (detectNew = false) => {
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
      
      // Detect new leads
      if (detectNew && leads.length > 0) {
        const existingIds = new Set(leads.map(l => l.id));
        const newIds = data.filter((lead: Lead) => !existingIds.has(lead.id)).map((l: Lead) => l.id);
        
        if (newIds.length > 0) {
          setNewLeadIds(new Set(newIds));
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setNewLeadIds(new Set());
          }, 3000);
        }
      }
      
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
          fetchLeads(true); // Detect new leads
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, debouncedSearchQuery, leads]);

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
      
      <main className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ärenden</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Hantera och följ upp inkommande leads från Blocket
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Skapa test-lead
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {statusFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant={statusFilter === filter.key ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1.5 transition-all hover:scale-105"
                  onClick={() => setStatusFilter(filter.key)}
                >
                  {filter.label}
                  {filter.key !== 'all' && (
                    <span className="ml-1.5 text-xs opacity-70">
                      {leads.filter(l => {
                        if (filter.key === 'unclaimed') return !l.claimed;
                        if (filter.key === 'claimed') return l.claimed;
                        return true;
                      }).length}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök på ämne, namn, e-post eller regnummer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </motion.div>

        {/* Leads List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <FileX className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Inga ärenden hittades</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery.trim() 
                    ? "Försök med andra söktermer eller ändra filtret."
                    : "Det finns inga ärenden att visa just nu. Skapa ett test-lead för att komma igång."
                  }
                </p>
                {!searchQuery.trim() && (
                  <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Skapa ett test-lead
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead, index) => {
              const isNew = newLeadIds.has(lead.id);
              return (
                <motion.div
                  key={lead.id}
                  initial={isNew ? { opacity: 0, y: -20, scale: 0.95 } : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: isNew ? 0 : index * 0.05,
                    type: "spring",
                    stiffness: isNew ? 300 : 200,
                    damping: isNew ? 20 : 25
                  }}
                >
                  <Card 
                    className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-primary/50 overflow-hidden h-full flex flex-col ${
                      isNew ? 'animate-pulse border-primary shadow-[0_0_30px_rgba(0,0,0,0.3)] dark:shadow-[0_0_30px_rgba(255,255,255,0.2)] bg-primary/5' : ''
                    }`}
                    onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                  >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge 
                        variant={lead.claimed ? "default" : "destructive"}
                        className="gap-1.5"
                      >
                        {lead.claimed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Upplockad
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Obevakad
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Store className="h-3 w-3" />
                        Blocket
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                      {lead.subject}
                    </CardTitle>
                    
                    <CardDescription className="flex items-center gap-1.5 text-xs mt-1.5">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(lead.created_at)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pb-3 flex-1">
                    {lead.summering && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {lead.summering}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{lead.lead_namn}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{lead.lead_email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Car className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-mono">{lead.regnr}</span>
                      </div>
                    </div>

                    {lead.preview_image_url && (
                      <div className="rounded-lg overflow-hidden border mt-3">
                        <img 
                          src={lead.preview_image_url} 
                          alt="Fordonsannons"
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3 border-t flex gap-2">
                    <Button
                      size="sm"
                      variant={lead.claimed ? "outline" : "default"}
                      disabled={lead.claimed}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaim(lead.id);
                      }}
                      className="flex-1 gap-1.5"
                    >
                      {lead.claimed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Upplockat
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Ta över
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blocket/arenden/${lead.id}`);
                      }}
                      className="gap-1"
                    >
                      Visa
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
            })}
          </div>
        )}
      </main>

      {showCreateDialog && (
        <CreateTestLeadForm onLeadCreated={handleLeadCreated} />
      )}
    </div>
  );
}