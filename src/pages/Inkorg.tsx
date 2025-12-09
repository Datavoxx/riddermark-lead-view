import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InboxMessage } from '@/types/inbox';
import { TopBar } from '@/components/TopBar';
import { ComposeEmailModal } from '@/components/ComposeEmailModal';
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
  RefreshCw,
  PenLine,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
        <div className={cn(
          "border-b bg-background/95 backdrop-blur-sm flex items-center gap-2 shadow-sm",
          isMobile ? "px-3 py-2" : "px-4 py-3 rounded-xl mx-2 mt-2"
        )}>
          {/* Ny e-post button - hidden on mobile since FAB handles it */}
          {!isMobile && (
            <>
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className={cn(
                        "h-10 px-4 rounded-l-xl rounded-r-none",
                        "bg-primary text-primary-foreground",
                        "hover:bg-primary/90",
                        "shadow-lg shadow-primary/25",
                        "transition-all duration-200",
                        "font-medium"
                      )}
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Ny e-post
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-xl">
                    <DropdownMenuItem 
                      className="rounded-lg cursor-pointer"
                      onClick={() => setIsComposeOpen(true)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Nytt meddelande
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="rounded-lg cursor-pointer"
                      onClick={() => setIsComposeOpen(true)}
                    >
                      <PenLine className="h-4 w-4 mr-2" />
                      Snabbsvar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="default"
                  size="icon"
                  className={cn(
                    "h-10 w-9 rounded-l-none rounded-r-xl",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90",
                    "shadow-lg shadow-primary/25",
                    "border-l border-primary-foreground/20",
                    "transition-all duration-200"
                  )}
                  onClick={() => toast.info('Välj e-posttyp från menyn')}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="h-6 w-px bg-border/50" />
            </>
          )}

          <Checkbox
            checked={selectedMessages.size === messages.length && messages.length > 0}
            onCheckedChange={handleSelectAll}
            className="flex-shrink-0"
          />
          
          {selectedMessages.size > 0 ? (
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={handleBulkArchive}
              >
                <Archive className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Arkivera</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Ta bort</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={handleBulkMarkAsRead}
              >
                <MailOpen className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Markera läst</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 md:px-3"
                onClick={handleBulkMarkAsUnread}
              >
                <Mail className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Markera oläst</span>
              </Button>
              <span className="text-xs md:text-sm text-muted-foreground ml-1">
                {selectedMessages.size} valda
              </span>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0"
              onClick={fetchMessages}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}

          {/* Search - hidden on mobile, show icon instead */}
          {!isMobile && (
            <div className="ml-auto flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök i Inkorg..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 rounded-full",
                    "bg-muted/50 border-transparent",
                    "focus:bg-background focus:border-primary",
                    "transition-all duration-200"
                  )}
                />
              </div>
            </div>
          )}
          
          {isMobile && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 ml-auto"
              onClick={() => {
                const query = prompt('Sök i inkorg:');
                if (query !== null) setSearchQuery(query);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className={cn(
          "bg-background/50 flex items-center overflow-x-auto",
          isMobile ? "px-3 py-2 gap-2" : "px-4 py-3 gap-3"
        )}>
          <button
            onClick={() => setStatusFilter('all')}
            className={cn(
              "text-sm rounded-full transition-all duration-200 flex-shrink-0",
              isMobile ? "px-3 py-1.5" : "px-4 py-2",
              statusFilter === 'all' 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            Alla
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={cn(
              "text-sm rounded-full transition-all duration-200 flex-shrink-0",
              isMobile ? "px-3 py-1.5" : "px-4 py-2",
              statusFilter === 'unread' 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            Olästa
          </button>
          <button
            onClick={() => setStatusFilter('starred')}
            className={cn(
              "text-sm rounded-full transition-all duration-200 flex-shrink-0",
              isMobile ? "px-3 py-1.5" : "px-4 py-2",
              statusFilter === 'starred' 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
            )}
          >
            Stjärnmärkta
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={cn(
              "text-sm rounded-full transition-all duration-200 flex-shrink-0",
              isMobile ? "px-3 py-1.5" : "px-4 py-2",
              statusFilter === 'archived' 
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
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
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground animate-fade-in">
              <div className="p-8 rounded-2xl bg-muted/30">
                <Mail className="h-20 w-20 text-muted-foreground/50" />
              </div>
              <p className="mt-6 text-lg">Inga meddelanden</p>
            </div>
          ) : (
            <div>
              {messages.map((message) => {
                const isUnread = message.status === 'unread';
                const isSelected = selectedMessages.has(message.id);
                const bodyPreview = message.body.substring(0, 80).replace(/\n/g, ' ');

                // OUTLOOK-STIL MOBIL LAYOUT - Super kompakt
                if (isMobile) {
                  return (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message.id)}
                      className={cn(
                        "flex items-start gap-2.5 px-3 py-2.5 cursor-pointer",
                        "border-b border-border/30",
                        "active:bg-accent/80",
                        isUnread && "bg-primary/5",
                        isSelected && "bg-accent"
                      )}
                    >
                      {/* Avatar cirkel - mindre */}
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                        isUnread ? "bg-primary/20" : "bg-muted"
                      )}>
                        <span className={cn(
                          "text-xs font-semibold",
                          isUnread ? "text-primary" : "text-muted-foreground"
                        )}>
                          {(message.from_name || message.from_email)[0].toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Innehåll - vertikal stack */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {/* Rad 1: Avsändare + stjärna + tid */}
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "truncate text-[13px]",
                            isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}>
                            {message.from_name || message.from_email}
                          </span>
                          
                          <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                            {message.starred && (
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            )}
                            <span className="text-[11px] text-muted-foreground">
                              {formatRelativeTime(message.received_at)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Rad 2: Ämne + badge */}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className={cn(
                            "text-[13px] truncate",
                            isUnread ? "font-medium text-foreground" : "text-muted-foreground"
                          )}>
                            {message.subject}
                          </p>
                          <Badge 
                            className={cn(
                              "text-[9px] rounded-full px-1.5 py-0 h-4 flex-shrink-0 ml-auto",
                              sourceConfig[message.source]?.color
                            )}
                          >
                            {sourceConfig[message.source]?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                }

                // DESKTOP LAYOUT - behåll befintlig
                return (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message.id)}
                    className={cn(
                      "group flex items-center gap-4 px-5 py-4 cursor-pointer",
                      "rounded-xl mx-2 my-1",
                      "transition-all duration-200 ease-out",
                      "hover:bg-accent/60 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01]",
                      isUnread && "bg-primary/5 border-l-4 border-primary",
                      isSelected && "bg-accent ring-2 ring-primary/20"
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
                          "h-5 w-5 cursor-pointer",
                          "transition-all duration-200",
                          "hover:scale-125",
                          message.starred 
                            ? "fill-yellow-400 text-yellow-400 animate-star-pop" 
                            : "text-muted-foreground hover:text-yellow-400"
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
                        className={cn(
                          "flex-shrink-0 text-xs rounded-full px-3 py-1",
                          "shadow-sm transition-all duration-200",
                          "group-hover:shadow-md",
                          sourceConfig[message.source]?.color
                        )}
                      >
                        {sourceConfig[message.source]?.label}
                      </Badge>

                      <span className="text-sm text-muted-foreground w-12 text-right flex-shrink-0">
                        {formatRelativeTime(message.received_at)}
                      </span>

                      <div className={cn(
                        "flex items-center gap-1 flex-shrink-0",
                        "opacity-0 group-hover:opacity-100",
                        "transition-all duration-200",
                        "translate-x-2 group-hover:translate-x-0"
                      )}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:scale-110 transition-transform"
                          onClick={(e) => handleArchive(e, message.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:scale-110 transition-transform"
                          onClick={(e) => handleDelete(e, message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {isUnread && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:scale-110 transition-transform"
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

      <ComposeEmailModal 
        open={isComposeOpen} 
        onOpenChange={setIsComposeOpen} 
      />
    </div>
  );
}
