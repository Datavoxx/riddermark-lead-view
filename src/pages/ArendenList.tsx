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
  ArrowRight, ChevronRight, MessageSquare 
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
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ärenden</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Hantera inkommande leads från Blocket
            </p>
          </div>
            
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 rounded-xl font-medium"
              size="default"
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
                  variant={statusFilter === filter.key ? "default" : "secondary"}
                  className={`cursor-pointer px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 ${
                    statusFilter === filter.key ? 'shadow-sm' : 'hover:bg-muted/80'
                  }`}
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
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Sök..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-full bg-muted/40 border-transparent focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10 transition-all duration-200 placeholder:text-muted-foreground/50"
            />
          </div>
        </motion.div>

        {/* Leads List */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border border-border/50">
                <CardHeader className="pb-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4 pb-4">
                  <div className="space-y-2 bg-muted/20 rounded-xl p-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-36 w-full rounded-xl" />
                </CardContent>
                <CardFooter className="pt-3 border-t border-border/50 flex gap-2">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border border-dashed border-border/60 bg-transparent">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                  <FileX className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Inga ärenden hittades</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  {searchQuery.trim() 
                    ? "Försök med andra söktermer eller ändra filtret."
                    : "Det finns inga ärenden just nu."
                  }
                </p>
                {!searchQuery.trim() && (
                  <Button onClick={() => setShowCreateDialog(true)} className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Skapa test-lead
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                    className={`group relative overflow-hidden bg-card border border-border/50 rounded-2xl transition-all duration-300 ease-out hover:border-border hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 cursor-pointer ${
                      isNew ? 'border-primary/50 bg-primary/5 shadow-md shadow-primary/10' : ''
                    }`}
                    onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                  >
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <CardHeader className="relative pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={lead.claimed ? "secondary" : "destructive"}
                        className="gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      >
                        {lead.claimed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Upplockad
                          </>
                        ) : (
                          <>
                            <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            Obevakad
                          </>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(lead.created_at)}
                      </span>
                    </div>
                    
                    <CardTitle className="text-base font-semibold line-clamp-2 leading-snug">
                      {lead.subject}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-4 pb-4">
                    {lead.summering && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {lead.summering}
                      </p>
                    )}
                    
                    <div className="space-y-2 text-sm bg-muted/30 rounded-xl p-3">
                      <div className="flex items-center gap-2.5 text-foreground/80">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{lead.lead_namn}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground/70">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate text-xs">{lead.lead_email}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-foreground/80">
                        <Car className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-xs font-semibold tracking-wide">{lead.regnr}</span>
                      </div>
                    </div>

                    {lead.preview_image_url && (
                      <div className="rounded-xl overflow-hidden">
                        <img 
                          src={lead.preview_image_url} 
                          alt="Fordon"
                          className="w-full h-36 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="relative pt-3 pb-4 px-4 border-t border-border/50 flex gap-2">
                    {!lead.claimed && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaim(lead.id);
                        }}
                        className="flex-1 rounded-xl font-medium h-9"
                      >
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
                      className="flex-1 rounded-xl font-medium h-9"
                    >
                      Visa
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
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