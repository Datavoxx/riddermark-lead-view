import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { 
  ArrowLeft, Clock, Car, Store, CheckCircle2, User, 
  Mail, Phone, ExternalLink, FileText, MapPin, 
  Globe, Paperclip, MoreVertical, Building2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ArendeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLead = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads/${id}?t=${Date.now()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ärendet hittades inte');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Received lead data:', data);
      console.log('Summering field:', data.summering);
      setLead(data);
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte hämta ärendet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleClaim = async () => {
    if (!lead) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ leadId: lead.id }),
      });

      if (response.status === 200) {
        toast({
          title: "Ärendet upplockat",
          description: "Du har tagit över ärendet framgångsrikt.",
        });
        fetchLead();
      } else if (response.status === 409) {
        toast({
          title: "Redan plockad",
          description: "Ärendet har redan plockats av en annan säljare.",
          variant: "destructive",
        });
        fetchLead();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openBlocketUrl = () => {
    if (lead?.blocket_url) {
      window.open(lead.blocket_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title={lead?.subject || "Ärende"} />
      
      <main className="container mx-auto p-4 lg:p-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blocket/arenden')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till ärenden
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : !lead ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h2 className="text-xl font-semibold mb-2">Ärendet hittades inte</h2>
            <p className="text-muted-foreground">
              Det ärendet du söker efter existerar inte eller har tagits bort.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-3"
          >
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Sammanfattning</CardTitle>
                  <CardDescription>
                    Snabb översikt av meddelande, kontakt och ärendestatus.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      variant={lead.claimed ? "default" : "destructive"}
                      className="gap-1.5"
                    >
                      {lead.claimed ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Upplockad
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4" />
                          Ny lead
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatDate(lead.created_at)}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Car className="h-4 w-4" />
                      Regnr: {lead.regnr}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Store className="h-4 w-4" />
                      Källa: Blocket
                    </Badge>
                  </div>
                  
                  <p className="leading-relaxed text-foreground">
                    {lead.summering || lead.summary}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-0">
                  <Button 
                    className="gap-2"
                    onClick={handleClaim}
                    disabled={lead.claimed}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Ta över ärendet
                  </Button>
                  <Button variant="secondary" className="gap-2">
                    <User className="h-4 w-4" />
                    Tilldela...
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Ringa
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => window.location.href = `mailto:${lead.lead_email}`}
                  >
                    <Mail className="h-4 w-4" />
                    Mejla
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <MoreVertical className="h-4 w-4" />
                        Mer
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Skapa uppgift</DropdownMenuItem>
                      <DropdownMenuItem>Markera som spam</DropdownMenuItem>
                      <DropdownMenuItem>Stäng ärende</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>

              {/* Message Details Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Meddelande</CardTitle>
                  <CardDescription>Inkommet via Blocket</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium mb-1">Mejl från Blocket</div>
                      <div className="text-sm text-muted-foreground mb-2">Ämne</div>
                      <div className="rounded-lg border p-3 text-sm bg-muted/30">
                        {lead.subject}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openBlocketUrl}
                          className="ml-2 h-6 px-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Datum/tid</div>
                        <div className="text-sm font-medium">{formatDate(lead.created_at)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Reg.nr</div>
                        <div className="text-sm font-medium font-mono">{lead.regnr}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Namn</div>
                        <div className="text-sm font-medium">{lead.lead_namn}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Email</div>
                        <div className="text-sm font-medium flex items-center gap-1">
                          <span className="truncate">{lead.lead_email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => navigator.clipboard.writeText(lead.lead_email)}
                          >
                            <FileText className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Meddelande</div>
                      <div className="rounded-xl border p-4 text-lg tracking-wide bg-background">
                        {lead.summary}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Kort fråga</Badge>
                        <Badge variant="outline">Behöver tolkning</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-0">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">🎙️ Röstinspelning</span>
                    </div>
                    <VoiceRecorder
                      leadId={lead.id}
                      resumeUrl={lead.resume_url || undefined}
                      onRecordingComplete={(audioBlob) => {
                        console.log("Recording complete:", audioBlob);
                      }}
                    />
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Listing Preview Card */}
              <Card className="shadow-sm overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Annons
                  </CardTitle>
                  <CardDescription>Från Blocket</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lead.preview_image_url && (
                    <a 
                      href={lead.blocket_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <motion.div
                        initial={{ scale: 0.98 }}
                        animate={{ scale: 1 }}
                        className="overflow-hidden rounded-xl border"
                      >
                        <img
                          src={lead.preview_image_url}
                          alt={lead.preview_title || "Fordonsannons"}
                          className="aspect-video w-full object-cover transition group-hover:scale-105"
                        />
                      </motion.div>
                    </a>
                  )}
                  
                  <div className="space-y-2">
                    <a 
                      href={lead.blocket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium leading-snug hover:underline block"
                    >
                      {lead.preview_title || lead.subject}
                    </a>
                    {lead.preview_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lead.preview_description}
                      </p>
                    )}
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Blocket
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 pt-0">
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                    onClick={openBlocketUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Öppna annons
                  </Button>
                </CardFooter>
              </Card>

              {/* Notes Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Anteckningar</CardTitle>
                  <CardDescription>Privata noteringar för teamet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea 
                    placeholder="Lägg till en snabb anteckning till ärendet..."
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" className="gap-2">
                      <Paperclip className="h-4 w-4" />
                      Bifoga
                    </Button>
                    <Button className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Spara
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Historik</CardTitle>
                  <CardDescription>Senaste händelser</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Store className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm">Lead inkom via Blocket</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm">Ärende skapat och tilldelat Inkommande</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}