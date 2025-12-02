import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InboxMessage } from '@/types/inbox';
import { TopBar } from '@/components/TopBar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  Archive, 
  Trash2, 
  MailOpen, 
  Mail,
  Search,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'unread' | 'starred' | 'archived';

const sourceConfig = {
  blocket: { label: 'Blocket', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  wayke: { label: 'Wayke', color: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  bytbil: { label: 'Bytbil', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
  manual: { label: 'Manuell', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-300' },
  other: { label: 'Övrigt', color: 'bg-gray-500/10 text-gray-700 dark:text-gray-300' },
};

export default function Inkorg() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('inbox_messages')
        .select('*')
        .order('received_at', { ascending: false });

      if (statusFilter === 'unread') {
        query = query.eq('status', 'unread');
      } else if (statusFilter === 'starred') {
        query = query.eq('starred', true);
      } else if (statusFilter === 'archived') {
        query = query.eq('status', 'archived');
      } else if (statusFilter === 'all') {
        query = query.neq('status', 'archived');
      }

      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,from_name.ilike.%${searchQuery}%,from_email.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages((data || []) as InboxMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Kunde inte hämta meddelanden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('inbox-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'inbox_messages' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, searchQuery]);

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'nu';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return time.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(m => m.id)));
    }
  };

  const handleSelectMessage = (id: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMessages(newSelected);
  };

  const handleToggleStar = async (e: React.MouseEvent, id: string, currentStarred: boolean) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ starred: !currentStarred })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Kunde inte uppdatera stjärnmarkering');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedMessages.size === 0) return;
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ status: 'archived' })
        .in('id', Array.from(selectedMessages));

      if (error) throw error;
      setSelectedMessages(new Set());
      fetchMessages();
      toast.success(`${selectedMessages.size} meddelanden arkiverade`);
    } catch (error) {
      console.error('Error archiving messages:', error);
      toast.error('Kunde inte arkivera meddelanden');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.size === 0) return;
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .delete()
        .in('id', Array.from(selectedMessages));

      if (error) throw error;
      setSelectedMessages(new Set());
      fetchMessages();
      toast.success(`${selectedMessages.size} meddelanden borttagna`);
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast.error('Kunde inte ta bort meddelanden');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedMessages.size === 0) return;
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .in('id', Array.from(selectedMessages));

      if (error) throw error;
      setSelectedMessages(new Set());
      fetchMessages();
      toast.success(`${selectedMessages.size} meddelanden markerade som lästa`);
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Kunde inte markera som lästa');
    }
  };

  const handleBulkMarkAsUnread = async () => {
    if (selectedMessages.size === 0) return;
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ status: 'unread', read_at: null })
        .in('id', Array.from(selectedMessages));

      if (error) throw error;
      setSelectedMessages(new Set());
      fetchMessages();
      toast.success(`${selectedMessages.size} meddelanden markerade som olästa`);
    } catch (error) {
      console.error('Error marking as unread:', error);
      toast.error('Kunde inte markera som olästa');
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
      toast.success('Meddelande arkiverat');
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Kunde inte arkivera meddelande');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
      toast.success('Meddelande borttaget');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Kunde inte ta bort meddelande');
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('inbox_messages')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Kunde inte markera som läst');
    }
  };

  const handleMessageClick = (id: string) => {
    navigate(`/inkorg/${id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopBar title="Inkorg" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-background px-4 py-2 flex items-center gap-2">
          <Checkbox
            checked={selectedMessages.size === messages.length && messages.length > 0}
            onCheckedChange={handleSelectAll}
          />
          
          {selectedMessages.size > 0 ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBulkArchive}
              >
                <Archive className="h-4 w-4 mr-2" />
                Arkivera
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Ta bort
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBulkMarkAsRead}
              >
                <MailOpen className="h-4 w-4 mr-2" />
                Markera läst
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBulkMarkAsUnread}
              >
                <Mail className="h-4 w-4 mr-2" />
                Markera oläst
              </Button>
              <span className="text-sm text-muted-foreground ml-2">
                {selectedMessages.size} valda
              </span>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={fetchMessages}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sök i Inkorg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="border-b bg-background px-4 py-2 flex items-center gap-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'all' 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Alla
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'unread' 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Olästa
          </button>
          <button
            onClick={() => setStatusFilter('starred')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'starred' 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Stjärnmärkta
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors",
              statusFilter === 'archived' 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            Arkiverade
          </button>
        </div>

        {/* Message list */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Mail className="h-16 w-16 mb-4" />
              <p className="text-lg">Inga meddelanden</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => {
                const isUnread = message.status === 'unread';
                const isSelected = selectedMessages.has(message.id);
                const bodyPreview = message.body.substring(0, 100).replace(/\n/g, ' ');

                return (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message.id)}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 border-b cursor-pointer transition-colors",
                      isUnread ? "bg-accent/20" : "hover:bg-muted/50",
                      isSelected && "bg-accent/40"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectMessage(message.id)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <button
                      onClick={(e) => handleToggleStar(e, message.id, message.starred)}
                      className="flex-shrink-0"
                    >
                      <Star
                        className={cn(
                          "h-5 w-5 transition-colors",
                          message.starred 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      />
                    </button>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span 
                        className={cn(
                          "w-48 truncate flex-shrink-0",
                          isUnread ? "font-semibold" : "text-muted-foreground"
                        )}
                      >
                        {message.from_name || message.from_email}
                      </span>

                      <div className="flex-1 flex items-baseline gap-2 min-w-0">
                        <span className={cn("truncate", isUnread && "font-semibold")}>
                          {message.subject}
                        </span>
                        <span className="text-muted-foreground text-sm truncate flex-shrink">
                          - {bodyPreview}
                        </span>
                      </div>

                      <Badge 
                        variant="outline" 
                        className={cn("flex-shrink-0 text-xs", sourceConfig[message.source]?.color)}
                      >
                        {sourceConfig[message.source]?.label}
                      </Badge>

                      <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
                        {formatRelativeTime(message.received_at)}
                      </span>

                      <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleArchive(e, message.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleDelete(e, message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => handleMarkAsRead(e, message.id)}
                          >
                            <MailOpen className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
