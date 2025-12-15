import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Mail, Phone, FileText, Loader2, ExternalLink, Car, Clock, Store, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Lead } from "@/types/lead";

interface ReminderData {
  id: string;
  lead_id: string | null;
  sent_email_text: string | null;
  original_message: string | null;
  remind_at: string;
  created_at: string | null;
  status: string | null;
}

export default function FollowUpDetail() {
  const { reminderId } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadLoading, setLeadLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!reminderId) return;

      // First fetch the reminder
      const { data: reminderData, error: reminderError } = await supabase
        .from("follow_up_reminders")
        .select("*")
        .eq("id", reminderId)
        .maybeSingle();

      if (reminderError) {
        console.error("Error fetching reminder:", reminderError);
        setLoading(false);
        return;
      }

      setReminder(reminderData);

      // If there's a lead_id, fetch the full lead data from API
      if (reminderData?.lead_id) {
        setLeadLoading(true);
        try {
          const response = await fetch(
            `https://fjqsaixszaqceviqwboz.functions.supabase.co/api-leads/${reminderData.lead_id}?t=${Date.now()}`
          );
          
          if (response.ok) {
            const leadData = await response.json();
            setLead(leadData);
          }
        } catch (error) {
          console.error("Error fetching lead:", error);
        }
        setLeadLoading(false);
      }

      setLoading(false);
    };

    fetchData();
  }, [reminderId]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy 'kl.' HH:mm", { locale: sv });
  };

  if (loading) {
    return (
      <>
        <TopBar title="Uppföljning" />
        <div className="p-3 md:p-6 max-w-3xl mx-auto pb-24 md:pb-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </>
    );
  }

  if (!reminder) {
    return (
      <>
        <TopBar title="Uppföljning" />
        <div className="p-3 md:p-6 max-w-3xl mx-auto pb-24 md:pb-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Påminnelsen hittades inte</p>
            <Button variant="outline" onClick={() => navigate("/notiser")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tillbaka till notiser
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Uppföljning" />
      <div className="p-3 md:p-6 max-w-3xl mx-auto pb-24 md:pb-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/notiser")}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Dags att följa upp</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Påminnelse för{" "}
            {reminder.remind_at && formatDate(reminder.remind_at)}
          </p>
        </div>

        <div className="space-y-4">
          {/* Lead info card - Full information like ArendeDetail */}
          {leadLoading ? (
            <Card className="rounded-xl md:rounded-2xl">
              <CardHeader className="p-4 md:p-6 pb-3">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ) : lead ? (
            <Card className="rounded-xl md:rounded-2xl border-l-4 border-l-primary">
              <CardHeader className="p-4 md:p-6 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Ärendeinformation
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Öppna ärende
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0 space-y-4">
                {/* Status badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(lead.created_at)}
                  </Badge>
                  {lead.regnr && (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full text-xs">
                      <Car className="h-3.5 w-3.5" />
                      {lead.regnr}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1.5 px-3 py-1 rounded-full text-xs">
                    <Store className="h-3.5 w-3.5" />
                    Blocket
                  </Badge>
                </div>

                {/* Lead details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Kund</p>
                    <p className="font-semibold text-foreground">{lead.lead_namn || "Okänd"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ämne</p>
                    <p className="font-semibold text-foreground">{lead.subject || "Inget ämne"}</p>
                  </div>
                  {lead.lead_email && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">E-post</p>
                      <p className="font-medium text-foreground">{lead.lead_email}</p>
                    </div>
                  )}
                  {lead.regnr && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Registreringsnummer</p>
                      <p className="font-medium text-foreground">{lead.regnr}</p>
                    </div>
                  )}
                </div>

                {/* Preview info if available */}
                {lead.preview_title && (
                  <div className="border border-border/50 rounded-xl p-4 flex gap-4">
                    {lead.preview_image_url && (
                      <img 
                        src={lead.preview_image_url} 
                        alt={lead.preview_title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground line-clamp-2">{lead.preview_title}</p>
                      {lead.preview_description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{lead.preview_description}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl md:rounded-2xl border-l-4 border-l-amber-500">
              <CardContent className="p-4 md:p-6 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Ingen ärendekoppling</p>
                  <p className="text-sm text-muted-foreground">
                    Denna påminnelse skapades utan koppling till ett specifikt ärende.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Original customer message */}
          {(reminder.original_message || lead?.summering || lead?.summary) && (
            <Card className="rounded-xl md:rounded-2xl">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Kundens meddelande
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="bg-muted/50 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {reminder.original_message || lead?.summering || lead?.summary}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your sent response */}
          {reminder.sent_email_text && (
            <Card className="rounded-xl md:rounded-2xl">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Ditt svar
                  {reminder.created_at && (
                    <span className="text-xs font-normal text-muted-foreground ml-2">
                      skickat {format(new Date(reminder.created_at), "d MMMM", { locale: sv })}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {reminder.sent_email_text}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {lead?.lead_email && (
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11"
                onClick={() => window.open(`mailto:${lead.lead_email}`, "_blank")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Skicka nytt mejl
              </Button>
            )}
            {lead && (
              <Button
                className="flex-1 rounded-xl h-11"
                onClick={() => navigate(`/blocket/arenden/${lead.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gå till ärendet
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
