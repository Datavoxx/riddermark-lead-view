import { useState, useEffect, useMemo, useRef } from "react";
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
import { NotificationPermissionBanner } from "@/components/NotificationPermissionBanner";

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
  const previousLeadsRef = useRef<Lead[]>([]);
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
      
      // Detect new leads using ref to avoid stale closure
      if (detectNew && previousLeadsRef.current.length > 0) {
        const existingIds = new Set(previousLeadsRef.current.map(l => l.id));
        const newIds = data.filter((lead: Lead) => !existingIds.has(lead.id)).map((l: Lead) => l.id);
        
        if (newIds.length > 0) {
          console.log('🆕 New leads detected:', newIds);
          setNewLeadIds(new Set(newIds));
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setNewLeadIds(new Set());
          }, 3000);
        }
      }
      
      previousLeadsRef.current = data;
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
        (payload) => {
          console.log('🔔 Realtime event:', payload.eventType, payload.new);
          fetchLeads(true); // Detect new leads
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
      
      <main className="container mx-auto p-4 lg:p-6 space-y-6 max-w-7xl">
        {/* Notification Permission Banner */}
        <NotificationPermissionBanner />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Ärenden</h1>
              <p className="text-muted-foreground text-sm mt-1.5 font-medium">
                Hantera och följ upp inkommande leads från Blocket
              </p>
            </div>
            
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 shadow-md hover:shadow-lg font-semibold"
              size="lg"
            >
              <Plus className="h-5 w-5" />
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
                  className={`cursor-pointer px-5 py-2 transition-all hover:scale-105 rounded-full font-semibold shadow-sm ${
                    statusFilter === filter.key ? 'shadow-md' : ''
                  }`}
                  onClick={() => setStatusFilter(filter.key)}
                >
                  {filter.label}
                  {filter.key !== 'all' && (
                    <span className="ml-2 text-xs opacity-80 font-bold">
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Sök på ämne, namn, e-post eller regnummer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base shadow-sm border-2 focus:border-primary/50 rounded-lg"
            />
          </div>
        </motion.div>

        {/* Leads List */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Skeleton className="h-7 w-24 rounded-full" />
                    <Skeleton className="h-7 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-5 w-3/4 mt-2" />
                  <Skeleton className="h-4 w-20 mt-2" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="space-y-2 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-40 w-full rounded-xl mt-4" />
                </CardContent>
                <CardFooter className="pt-4 border-t-2 flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-md" />
                  <Skeleton className="h-9 flex-1 rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-dashed border-2 bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-12 text-center">
                <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 shadow-inner">
                  <FileX className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Inga ärenden hittades</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base leading-relaxed">
                  {searchQuery.trim() 
                    ? "Försök med andra söktermer eller ändra filtret."
                    : "Det finns inga ärenden att visa just nu. Skapa ett test-lead för att komma igång."
                  }
                </p>
                {!searchQuery.trim() && (
                  <Button onClick={() => setShowCreateDialog(true)} size="lg" className="gap-2 shadow-lg font-semibold">
                    <Plus className="h-5 w-5" />
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
                    className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/40 overflow-hidden h-full flex flex-col hover:scale-[1.02] bg-gradient-to-br from-card to-card/50 ${
                      isNew ? 'border-primary/70 bg-primary/10 animate-fade-in shadow-lg shadow-primary/20' : ''
                    }`}
                    onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                  >
                  <CardHeader className="pb-4 bg-gradient-to-br from-background/50 to-transparent">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge 
                        variant={lead.claimed ? "default" : "destructive"}
                        className="gap-1.5 px-3 py-1 rounded-full font-semibold shadow-sm"
                      >
                        {lead.claimed ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Upplockad
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            Obevakad
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1 rounded-full border-2 font-medium">
                        <Store className="h-3.5 w-3.5" />
                        Blocket
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {lead.subject}
                    </CardTitle>
                    
                    <CardDescription className="flex items-center gap-2 text-xs mt-2 font-medium">
                      <Clock className="h-3.5 w-3.5" />
                      {formatRelativeTime(lead.created_at)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4 flex-1">
                    {lead.summary && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Meddelande</h4>
                        <p className="text-sm text-foreground/90 line-clamp-3 leading-relaxed bg-muted/20 rounded-lg p-3 border">
                          {lead.summary}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2.5 text-sm bg-muted/30 rounded-lg p-3 border">
                      <div className="flex items-center gap-3 text-foreground/80 hover:text-foreground transition-colors">
                        <User className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="truncate font-medium">{lead.lead_namn}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-foreground/80 hover:text-foreground transition-colors">
                        <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="truncate">{lead.lead_email}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-foreground/80 hover:text-foreground transition-colors">
                        <Car className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="font-mono font-semibold">{lead.regnr}</span>
                      </div>
                    </div>

                    {lead.preview_image_url && (
                      <div className="rounded-xl overflow-hidden border-2 shadow-md group-hover:shadow-lg transition-shadow">
                        <img 
                          src={lead.preview_image_url} 
                          alt="Fordonsannons"
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-4 border-t-2 flex gap-2 bg-gradient-to-br from-background/30 to-transparent">
                    {!lead.claimed && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(lead.id);
                        }}
                        className="flex-1 gap-2 font-semibold shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Ta över
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant={lead.claimed ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blocket/arenden/${lead.id}`);
                      }}
                      className={`gap-2 font-semibold shadow-sm ${!lead.claimed ? 'flex-1' : 'flex-1'}`}
                    >
                      Visa
                      <ArrowRight className="h-4 w-4" />
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