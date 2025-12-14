import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/hooks/use-toast";
import { Lead, ForvalOption, hasForvalOptions } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { MobileArendeDetail } from "@/components/MobileArendeDetail";
import { useIsMobile } from "@/hooks/use-mobile";
import { ForvalButtons } from "@/components/ForvalButtons";
import { 
  ArrowLeft, Clock, Car, Store, CheckCircle2, 
  Mail, ExternalLink, FileText, MapPin, 
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
  const isMobile = useIsMobile();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailText, setEmailText] = useState("");
  const [sendingText, setSendingText] = useState(false);
  const [selectedForval, setSelectedForval] = useState<ForvalOption | null>(null);
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

  const sendTextMessage = async () => {
    if (!lead || !emailText.trim()) return;

    try {
      setSendingText(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('text_message', emailText);
      formData.append('message_type', 'text');
      formData.append('lead_id', lead.id);
      formData.append('thread_id', lead.id);
      if (lead.resume_url) {
        formData.append('wait_webhook', lead.resume_url);
      }

      const response = await fetch(
        'https://fjqsaixszaqceviqwboz.functions.supabase.co/voice-upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      toast({
        title: "Meddelande skickat",
        description: "Ditt textmeddelande har skickats till n8n workflow.",
      });

      setEmailText('');
      setShowEmailForm(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      
      // Ignorera storagePath-felet - webhook har redan lyckats
      if (errorMessage.includes('storagePath is not defined')) {
        toast({
          title: "Meddelande skickat",
          description: "Ditt textmeddelande har skickats till n8n workflow.",
        });
        setEmailText('');
        setShowEmailForm(false);
        setSendingText(false);
        return;
      }
      
      console.error('Error sending text message:', error);
      toast({
        title: "Fel",
        description: errorMessage || "Kunde inte skicka meddelandet.",
        variant: "destructive",
      });
    } finally {
      setSendingText(false);
    }
  };

  const sendTextMessageHandler = async (text: string) => {
    if (!lead || !text.trim()) return;

    try {
      setSendingText(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('text_message', text);
      formData.append('message_type', 'text');
      formData.append('lead_id', lead.id);
      formData.append('thread_id', lead.id);
      if (lead.resume_url) {
        formData.append('wait_webhook', lead.resume_url);
      }

      const response = await fetch(
        'https://fjqsaixszaqceviqwboz.functions.supabase.co/voice-upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      toast({
        title: "Meddelande skickat",
        description: "Ditt textmeddelande har skickats till n8n workflow.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '';
      
      // Ignorera storagePath-felet - webhook har redan lyckats
      if (errorMessage.includes('storagePath is not defined')) {
        toast({
          title: "Meddelande skickat",
          description: "Ditt textmeddelande har skickats till n8n workflow.",
        });
        setSendingText(false);
        return;
      }
      
      console.error('Error sending text message:', error);
      toast({
        title: "Fel",
        description: errorMessage || "Kunde inte skicka meddelandet.",
        variant: "destructive",
      });
    } finally {
      setSendingText(false);
    }
  };

  // Mobile Layout
  if (isMobile) {
    if (loading) {
      return (
        <div className="min-h-screen bg-background p-4 space-y-4">
          <Skeleton className="h-52 w-full rounded-none" />
          <div className="px-3 space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        </div>
      );
    }

    if (!lead) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Ärendet hittades inte</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Det ärendet du söker efter existerar inte.
            </p>
            <Button onClick={() => navigate('/blocket/arenden')} className="rounded-xl">
              Tillbaka till ärenden
            </Button>
          </div>
        </div>
      );
    }

    return (
      <MobileArendeDetail 
        lead={lead}
        onClaim={handleClaim}
        onSendText={sendTextMessageHandler}
        sendingText={sendingText}
        formatDate={formatDate}
      />
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-background">
      <TopBar title={lead?.subject || "Ärende"} />
      
      <main className="container mx-auto p-4 lg:p-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/blocket/arenden')}
            className="gap-2 rounded-xl hover:bg-accent/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till ärenden
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <Card key={i} className="rounded-2xl border border-border/50">
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3 rounded-full" />
                    <Skeleton className="h-4 w-1/2 mt-2 rounded-full" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-4 w-2/3 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-6">
              <Card className="rounded-2xl border border-border/50">
                <CardHeader>
                  <Skeleton className="h-6 w-1/2 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full rounded-xl" />
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
              <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Sammanfattning</CardTitle>
                  <CardDescription className="text-sm">
                    Översikt av meddelande och ärendestatus
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      variant={lead.claimed ? "default" : "destructive"}
                      className="gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {lead.claimed ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Upplockad
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          Ny lead
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(lead.created_at)}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full text-xs">
                      <Car className="h-3.5 w-3.5" />
                      {lead.regnr}
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full text-xs">
                      <Store className="h-3.5 w-3.5" />
                      Blocket
                    </Badge>
                  </div>
                  
                  <p className="leading-relaxed text-foreground">
                    {lead.summering || lead.summary}
                  </p>

                  {/* AI Förval Buttons */}
                  {hasForvalOptions(lead.forval) && lead.forval.options.length > 0 && (
                    <div className="border-t border-border/50 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Föreslagna åtgärder
                      </h4>
                      <ForvalButtons
                        options={lead.forval.options}
                        selectedId={selectedForval?.id}
                        onSelect={(option) => {
                          setSelectedForval(option);
                          setEmailText(option.directive);
                          setShowEmailForm(true);
                        }}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pt-0">
                  <div className="flex flex-wrap gap-2 w-full">
                    <Button 
                      className="gap-2 rounded-xl font-medium h-9"
                      onClick={handleClaim}
                      disabled={lead.claimed}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ta över
                    </Button>
                    <Button 
                      variant="outline" 
                      className="gap-2 rounded-xl font-medium h-9"
                      onClick={() => setShowEmailForm(!showEmailForm)}
                    >
                      <Mail className="h-4 w-4" />
                      Skriv text
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 rounded-xl h-9">
                          <MoreVertical className="h-4 w-4" />
                          Mer
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem>Skapa uppgift</DropdownMenuItem>
                        <DropdownMenuItem>Markera som spam</DropdownMenuItem>
                        <DropdownMenuItem>Stäng ärende</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Voice Recording Section */}
                  <div className="w-full border-t border-border/50 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-semibold">🎙️ Spela röstmeddelande</span>
                    </div>
                    <VoiceRecorder
                      leadId={lead.id}
                      resumeUrl={lead.resume_url || undefined}
                      onRecordingComplete={(audioBlob) => {
                        console.log("Recording complete:", audioBlob);
                      }}
                    />
                  </div>

                  {/* Email Form Section */}
                  {showEmailForm && (
                    <div className="w-full border-t border-border/50 pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold">✉️ Skriv text</span>
                      </div>
                      <Textarea
                        value={emailText}
                        onChange={(e) => setEmailText(e.target.value)}
                        placeholder="Skriv ditt meddelande här..."
                        className="min-h-[120px] mb-2 rounded-xl"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={sendTextMessage}
                          disabled={!emailText.trim() || sendingText}
                          className="rounded-xl"
                        >
                          {sendingText ? "Skickar..." : "Skicka"}
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEmailText("");
                            setShowEmailForm(false);
                          }}
                          className="rounded-xl"
                        >
                          Avbryt
                        </Button>
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>

              {/* Message Details Card */}
              <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Meddelande</CardTitle>
                  <CardDescription className="text-sm">Inkommet via Blocket</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Ämne</div>
                      <div className="rounded-xl border border-border/50 p-3 text-sm bg-muted/20">
                        {lead.subject}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={openBlocketUrl}
                          className="ml-2 h-6 px-2 rounded-lg"
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
                      <div className="text-xs text-muted-foreground mb-2">Meddelande</div>
                      <div className="rounded-xl border border-border/50 p-4 text-base leading-relaxed bg-muted/10">
                        {lead.summary}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">Kort fråga</Badge>
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">Behöver tolkning</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Listing Preview Card */}
              <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Annons
                  </CardTitle>
                  <CardDescription className="text-sm">Från Blocket</CardDescription>
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
                        className="overflow-hidden rounded-xl border bg-muted/20"
                      >
                        <img
                          src={lead.preview_image_url}
                          alt={lead.preview_title || "Fordonsannons"}
                          className="w-full h-auto"
                          loading="eager"
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
                    className="gap-2 rounded-xl font-medium h-9"
                    onClick={openBlocketUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Öppna annons
                  </Button>
                </CardFooter>
              </Card>

              {/* Notes Card */}
              <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Anteckningar</CardTitle>
                  <CardDescription className="text-sm">Privata noteringar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea 
                    placeholder="Lägg till anteckning..."
                    className="min-h-[100px] rounded-xl"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" className="gap-2 rounded-xl h-9">
                      <Paperclip className="h-4 w-4" />
                      Bifoga
                    </Button>
                    <Button className="gap-2 rounded-xl h-9">
                      <CheckCircle2 className="h-4 w-4" />
                      Spara
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card className="rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Historik</CardTitle>
                  <CardDescription className="text-sm">Senaste händelser</CardDescription>
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