import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowLeft, Clock, Car, Store, CheckCircle2, 
  Mail, ExternalLink, ChevronDown, Mic,
  User, FileText, History, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileArendeDetailProps {
  lead: Lead;
  onClaim: () => void;
  onSendText: (text: string) => Promise<void>;
  sendingText: boolean;
  formatDate: (date: string) => string;
}

export function MobileArendeDetail({ 
  lead, 
  onClaim, 
  onSendText,
  sendingText,
  formatDate 
}: MobileArendeDetailProps) {
  const navigate = useNavigate();
  const [showTextInput, setShowTextInput] = useState(false);
  const [emailText, setEmailText] = useState("");
  const [customerInfoOpen, setCustomerInfoOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleSendText = async () => {
    if (!emailText.trim()) return;
    await onSendText(emailText);
    setEmailText("");
    setShowTextInput(false);
  };

  const openBlocketUrl = () => {
    if (lead?.blocket_url) {
      window.open(lead.blocket_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-36">
      {/* Hero Section with Car Image */}
      <div className="relative">
        {/* Back Button - Floating */}
        <button
          onClick={() => navigate('/blocket/arenden')}
          className="absolute top-3 left-3 z-10 bg-black/40 backdrop-blur-sm text-white 
            p-2 rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Hero Image */}
        <div 
          className="relative h-52 bg-muted cursor-pointer"
          onClick={openBlocketUrl}
        >
          {lead.preview_image_url ? (
            <img
              src={lead.preview_image_url}
              alt={lead.preview_title || "Fordon"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Car className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Overlay Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant={lead.claimed ? "default" : "destructive"}
                className="gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full"
              >
                {lead.claimed ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Upplockad
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    Ny lead
                  </>
                )}
              </Badge>
              <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-[10px] rounded-full bg-white/20 text-white border-0">
                <Car className="h-3 w-3" />
                {lead.regnr}
              </Badge>
            </div>
            <h1 className="text-base font-semibold line-clamp-2 leading-tight">
              {lead.subject}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
              <Clock className="h-3 w-3" />
              {formatDate(lead.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="overview" className="px-3 pt-3">
        <TabsList className="w-full h-10 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Översikt
          </TabsTrigger>
          <TabsTrigger 
            value="message" 
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Meddelande
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="flex-1 text-xs rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Aktivitet
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-3 space-y-3">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 p-4"
          >
            <h3 className="text-sm font-semibold mb-2">Sammanfattning</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lead.summering || lead.summary}
            </p>
          </motion.div>

          {/* Customer Info - Collapsible */}
          <Collapsible open={customerInfoOpen} onOpenChange={setCustomerInfoOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between bg-card rounded-2xl border border-border/50 p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Kundinfo</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  customerInfoOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card rounded-b-2xl border border-t-0 border-border/50 px-4 pb-4 -mt-2 pt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Namn</div>
                    <div className="text-sm font-medium">{lead.lead_namn}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-0.5">Reg.nr</div>
                    <div className="text-sm font-medium font-mono">{lead.regnr}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                  <div className="text-sm font-medium truncate">{lead.lead_email}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl h-8 text-xs"
                  onClick={openBlocketUrl}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Öppna Blocket-annons
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes - Collapsible */}
          <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between bg-card rounded-2xl border border-border/50 p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Anteckningar</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  notesOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card rounded-b-2xl border border-t-0 border-border/50 px-4 pb-4 -mt-2 pt-2">
                <Textarea 
                  placeholder="Lägg till anteckning..."
                  className="min-h-[80px] rounded-xl text-sm"
                />
                <Button size="sm" className="w-full mt-2 rounded-xl h-8 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1.5" />
                  Spara
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* History - Collapsible */}
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between bg-card rounded-2xl border border-border/50 p-4 active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Historik</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  historyOpen && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-card rounded-b-2xl border border-t-0 border-border/50 px-4 pb-4 -mt-2 pt-2 space-y-3">
                <div className="flex items-start gap-3">
                  <Store className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm">Lead inkom via Blocket</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm">Ärende skapat</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </TabsContent>

        {/* Message Tab */}
        <TabsContent value="message" className="mt-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 p-4 space-y-4"
          >
            <div>
              <div className="text-xs text-muted-foreground mb-1">Ämne</div>
              <div className="text-sm font-medium">{lead.subject}</div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-2">Meddelande</div>
              <div className="bg-muted/30 rounded-xl p-3 text-sm leading-relaxed">
                {lead.summary}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[10px]">
                Kort fråga
              </Badge>
              <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px]">
                Behöver tolkning
              </Badge>
            </div>
          </motion.div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 p-4 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Store className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 pt-1">
                <div className="text-sm font-medium">Lead inkom via Blocket</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(lead.created_at)}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 pt-1">
                <div className="text-sm font-medium">Ärende skapat och tilldelat</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(lead.created_at)}
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Voice Recorder Section (only visible when expanded) */}
      {!showTextInput && (
        <div className="px-3 mt-3">
          <div className="bg-card rounded-2xl border border-border/50 p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-3">🎙️ RÖSTMEDDELANDE</div>
            <VoiceRecorder
              leadId={lead.id}
              resumeUrl={lead.resume_url || undefined}
              onRecordingComplete={(audioBlob) => {
                console.log("Recording complete:", audioBlob);
              }}
            />
          </div>
        </div>
      )}

      {/* Text Input Section (expandable) */}
      {showTextInput && (
        <div className="px-3 mt-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border/50 p-4"
          >
            <div className="text-xs font-semibold text-muted-foreground mb-2">✉️ SKRIV TEXT</div>
            <Textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="Skriv ditt meddelande här..."
              className="min-h-[100px] rounded-xl text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm"
                onClick={handleSendText}
                disabled={!emailText.trim() || sendingText}
                className="flex-1 rounded-xl h-9 text-xs"
              >
                {sendingText ? "Skickar..." : "Skicka"}
              </Button>
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  setEmailText("");
                  setShowTextInput(false);
                }}
                className="rounded-xl h-9 text-xs"
              >
                Avbryt
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sticky Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-3 pt-2
        bg-gradient-to-t from-background via-background to-transparent">
        <div className="bg-card/95 backdrop-blur-lg rounded-2xl border border-border/50 
          shadow-lg shadow-black/5 p-2 flex items-center gap-2">
          
          {/* Voice Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0 rounded-xl flex-shrink-0"
            onClick={() => {
              setShowTextInput(false);
              // Scroll to voice recorder
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Claim Button */}
          <Button 
            size="sm"
            onClick={onClaim}
            disabled={lead.claimed}
            className="h-10 flex-1 rounded-xl text-xs font-medium gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {lead.claimed ? "Upplockad" : "Ta över"}
          </Button>

          {/* Text Button */}
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowTextInput(!showTextInput)}
            className="h-10 flex-1 rounded-xl text-xs font-medium gap-1.5"
          >
            <Mail className="h-4 w-4" />
            Skriv text
          </Button>
        </div>
      </div>
    </div>
  );
}
