import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InboxMessage } from "@/types/inbox";
import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadCardSkeleton } from "@/components/LeadCardSkeleton";
import { 
  Search, Mail, User, Clock, ArrowRight, 
  Inbox, Archive, Eye, MessageSquare 
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

type StatusFilter = 'all' | 'unread' | 'read' | 'archived';

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

export default function Inkorg() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const previousMessagesRef = useRef<InboxMessage[]>([]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('inbox_messages')
        .select('*')
        .order('received_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (debouncedSearch) {
        query = query.or(`subject.ilike.%${debouncedSearch}%,from_email.ilike.%${debouncedSearch}%,from_name.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      previousMessagesRef.current = messages;
      setMessages((data || []) as InboxMessage[]);
    } catch (error) {
      console.error('Error fetching inbox messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, debouncedSearch]);

  useEffect(() => {
    const channel = supabase
      .channel('inbox-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inbox_messages'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, debouncedSearch]);

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Nyss';
    if (diffMins < 60) return `${diffMins}m sedan`;
    if (diffHours < 24) return `${diffHours}h sedan`;
    return `${diffDays}d sedan`;
  };

  const handleMessageClick = (messageId: string) => {
    navigate(`/inkorg/${messageId}`);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
      <TopBar title="Inkorg" />
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Inkorg</h1>
              <p className="text-muted-foreground mt-1">Hantera alla inkommande meddelanden</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 transition-colors hover:bg-primary/90"
                onClick={() => setStatusFilter('all')}
              >
                Alla
              </Badge>
              <Badge
                variant={statusFilter === 'unread' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 transition-colors hover:bg-primary/90"
                onClick={() => setStatusFilter('unread')}
              >
                Olästa
              </Badge>
              <Badge
                variant={statusFilter === 'read' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 transition-colors hover:bg-primary/90"
                onClick={() => setStatusFilter('read')}
              >
                Lästa
              </Badge>
              <Badge
                variant={statusFilter === 'archived' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 transition-colors hover:bg-primary/90"
                onClick={() => setStatusFilter('archived')}
              >
                Arkiverade
              </Badge>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Sök i inkorg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <LeadCardSkeleton key={i} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Mail className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Inga meddelanden</h3>
                <p className="text-muted-foreground max-w-md">
                  {statusFilter !== 'all' 
                    ? `Det finns inga ${statusFilter === 'unread' ? 'olästa' : statusFilter === 'read' ? 'lästa' : 'arkiverade'} meddelanden just nu.`
                    : 'Din inkorg är tom.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {messages.map((message) => {
                const statusInfo = statusConfig[message.status];
                const sourceInfo = sourceConfig[message.source];

                return (
                  <Card
                    key={message.id}
                    className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden cursor-pointer"
                    onClick={() => handleMessageClick(message.id)}
                  >
                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="outline" className={sourceInfo.color}>
                          {sourceInfo.label}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {message.subject}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatRelativeTime(message.received_at)}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pb-4">
                      <div className="space-y-2.5 text-sm bg-muted/30 rounded-lg p-3 border">
                        <div className="flex items-center gap-3 text-foreground/80">
                          <User className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="truncate font-medium">
                            {message.from_name || message.from_email}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-foreground/80">
                          <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="truncate">{message.from_email}</span>
                        </div>
                      </div>

                      {message.body && (
                        <div className="flex items-start gap-3 text-foreground/80">
                          <MessageSquare className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                          <p className="text-sm line-clamp-3 leading-relaxed">
                            {message.body}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 group-hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageClick(message.id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          Visa
                        </Button>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
