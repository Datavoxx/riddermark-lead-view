import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Mail, Phone, FileText, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface ReminderData {
  id: string;
  lead_id: string | null;
  sent_email_text: string | null;
  original_message: string | null;
  remind_at: string;
  created_at: string | null;
  status: string | null;
  leads: {
    lead_namn: string | null;
    subject: string | null;
    regnr: string | null;
    lead_email: string | null;
    summering: string | null;
    created_at: string | null;
  } | null;
}

export default function FollowUpDetail() {
  const { reminderId } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState<ReminderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReminder = async () => {
      if (!reminderId) return;

      const { data, error } = await supabase
        .from("follow_up_reminders")
        .select(`
          id,
          lead_id,
          sent_email_text,
          original_message,
          remind_at,
          created_at,
          status,
          leads (
            lead_namn,
            subject,
            regnr,
            lead_email,
            summering,
            created_at
          )
        `)
        .eq("id", reminderId)
        .single();

      if (error) {
        console.error("Error fetching reminder:", error);
      } else {
        setReminder(data as ReminderData);
      }
      setLoading(false);
    };

    fetchReminder();
  }, [reminderId]);

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

  const lead = reminder.leads;
  const leadName = lead?.lead_namn || "Okänd kund";
  const subject = lead?.subject || "Ärende";

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
            Påminnelse skapad{" "}
            {reminder.created_at && format(new Date(reminder.created_at), "d MMMM yyyy", { locale: sv })}
          </p>
        </div>

        <div className="space-y-4">
          {/* Lead info card */}
          <Card className="rounded-xl md:rounded-2xl">
            <CardHeader className="p-4 md:p-6 pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Ärendeinformation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Kund</p>
                  <p className="font-medium text-foreground">{leadName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ämne</p>
                  <p className="font-medium text-foreground">{subject}</p>
                </div>
                {lead?.regnr && (
                  <div>
                    <p className="text-xs text-muted-foreground">Regnr</p>
                    <p className="font-medium text-foreground">{lead.regnr}</p>
                  </div>
                )}
                {lead?.lead_email && (
                  <div>
                    <p className="text-xs text-muted-foreground">E-post</p>
                    <p className="font-medium text-foreground">{lead.lead_email}</p>
                  </div>
                )}
                {lead?.created_at && (
                  <div>
                    <p className="text-xs text-muted-foreground">Inkommit</p>
                    <p className="font-medium text-foreground">
                      {format(new Date(lead.created_at), "d MMMM yyyy", { locale: sv })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Original message card */}
          {(reminder.original_message || lead?.summering) && (
            <Card className="rounded-xl md:rounded-2xl">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Kundens meddelande
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                  {reminder.original_message || lead?.summering}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sent response card */}
          {reminder.sent_email_text && (
            <Card className="rounded-xl md:rounded-2xl">
              <CardHeader className="p-4 md:p-6 pb-3">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Ditt svar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
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
                className="flex-1 rounded-xl"
                onClick={() => window.open(`mailto:${lead.lead_email}`, "_blank")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Skicka nytt mejl
              </Button>
            )}
            {reminder.lead_id && (
              <Button
                className="flex-1 rounded-xl"
                onClick={() => navigate(`/blocket/arenden/${reminder.lead_id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visa ärendet
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
