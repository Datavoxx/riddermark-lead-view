import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InboxMessage } from "@/types/inbox";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Mail, User, Clock, Archive, 
  CheckCircle2, MessageSquare 
} from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  unread: { label: 'Oläst', color: 'bg-primary text-primary-foreground' },
  read: { label: 'Läst', color: 'bg-muted text-muted-foreground' },
  archived: { label: 'Arkiverad', color: 'bg-secondary text-secondary-foreground' }
};

const sourceConfig = {
  blocket: { label: 'Blocket', color: 'border-red-500 text-red-700 dark:text-red-400' },
  wayke: { label: 'Wayke', color: 'border-blue-500 text-blue-700 dark:text-blue-400' },
  bytbil: { label: 'Bytbil', color: 'border-green-500 text-green-700 dark:text-green-400' },
  manual: { label: 'Manuell', color: 'border-purple-500 text-purple-700 dark:text-purple-400' },
  other: { label: 'Övrigt', color: 'border-gray-500 text-gray-700 dark:text-gray-400' }
};

export default function InkorgDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<InboxMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('inbox_messages')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setMessage(data as InboxMessage);
          
          // Mark as read if unread
          if (data.status === 'unread') {
            await supabase
              .from('inbox_messages')
              .update({ 
                status: 'read',
                read_at: new Date().toISOString()
              })
              .eq('id', id);
          }
        }
      } catch (error) {
        console.error('Error fetching message:', error);
        toast.error('Kunde inte hämta meddelandet');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleArchive = async () => {
    if (!message) return;

    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ status: 'archived' })
        .eq('id', message.id);

      if (error) throw error;

      toast.success('Meddelandet arkiverat');
      navigate('/inkorg');
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Kunde inte arkivera meddelandet');
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <TopBar title="Inkorg" />
        <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-10 w-32" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <TopBar title="Inkorg" />
        <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Meddelande hittades inte</h3>
              <Button onClick={() => navigate('/inkorg')} className="mt-4">
                Tillbaka till Inkorg
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const statusInfo = statusConfig[message.status];
  const sourceInfo = sourceConfig[message.source];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      <TopBar title="Inkorg" />
      
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="space-y-6">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate('/inkorg')}
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till Inkorg
          </Button>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
                <Badge variant="outline" className={sourceInfo.color}>
                  {sourceInfo.label}
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                  {message.subject}
                </h1>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Mottaget: {formatDateTime(message.received_at)}</span>
                  </div>

                  <div className="space-y-2.5 text-sm bg-muted/30 rounded-lg p-4 border">
                    <div className="flex items-center gap-3 text-foreground/80">
                      <User className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="font-medium">
                        {message.from_name || 'Okänd avsändare'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-foreground/80">
                      <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{message.from_email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="bg-muted/20 rounded-lg p-6 border">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.body}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                {message.status !== 'archived' && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleArchive}
                  >
                    <Archive className="h-4 w-4" />
                    Arkivera
                  </Button>
                )}
                
                {message.status === 'read' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Läst {message.read_at && formatDateTime(message.read_at)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
