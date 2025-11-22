import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { SuggestedPrompts } from './SuggestedPrompts';
import { Message } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatContainerProps {
  channelId?: string;
  agentId?: string;
  agentName?: string;
}

export const ChatContainer = ({ channelId, agentId, agentName }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChannel, setIsLoadingChannel] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [channelName, setChannelName] = useState<string>('');
  const [isGroupChannel, setIsGroupChannel] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ladda aktuell användare och hitta namnet på den andra användaren eller gruppkanalen
  useEffect(() => {
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('user_id', user.id)
          .single();
        
        setCurrentUser({
          id: user.id,
          name: profile?.name || user.email || 'Okänd'
        });

        if (channelId) {
          // Kolla först om det är en gruppkanal
          const { data: groupChannel } = await supabase
            .from('group_channels')
            .select('name')
            .eq('id', channelId)
            .maybeSingle();

          if (groupChannel) {
            setChannelName(groupChannel.name);
            setIsGroupChannel(true);
          } else {
            // Om inte gruppkanal, kolla conversations
            const { data: conversation } = await supabase
              .from('conversations')
              .select('participant_1_id, participant_2_id')
              .eq('id', channelId)
              .maybeSingle();

            if (conversation) {
              const otherUserId = conversation.participant_1_id === user.id
                ? conversation.participant_2_id
                : conversation.participant_1_id;

              const { data: otherProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('user_id', otherUserId)
                .single();

              setOtherUserName(otherProfile?.name || 'Okänd');
              setIsGroupChannel(false);
            }
          }
        }
      }
    };
    loadCurrentUser();
  }, [channelId]);

  // Ladda meddelanden och sätt upp real-time prenumeration
  useEffect(() => {
    if (!channelId) return;

    isMountedRef.current = true;
    setIsLoadingChannel(true);

    const abortController = new AbortController();

    const loadMessages = async () => {
      try {
        // Early return om komponenten unmountats
        if (!isMountedRef.current) return;
        
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            profiles!messages_sender_id_fkey(name)
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })
          .abortSignal(abortController.signal);

        // Check igen efter async operation
        if (!isMountedRef.current) return;

        if (error) {
          // Ignorera helt om det är AbortError
          if (error.message?.includes('aborted') || error.code === '20') {
            console.log('[Chat] Request aborted (expected during cleanup)');
            setIsLoadingChannel(false);
            return;
          }
          
          console.error('Error loading messages:', error);
          toast({
            title: 'Kunde inte ladda meddelanden',
            description: error.message,
            variant: 'destructive',
          });
          setIsLoadingChannel(false);
          return;
        }

        const formattedMessages: Message[] = (data || []).map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.profiles?.name || 'Okänd',
          content: msg.content,
          created_at: msg.created_at,
          mentions: msg.mentions,
        }));

        if (isMountedRef.current) {
          setMessages(formattedMessages);
          setIsLoadingChannel(false);
        }
      } catch (err: any) {
        // Ignorera AbortError helt utan att logga
        if (err.name === 'AbortError' || !isMountedRef.current) {
          setIsLoadingChannel(false);
          return;
        }
        
        console.error('Unexpected error loading messages:', err);
        if (isMountedRef.current) {
          setIsLoadingChannel(false);
          toast({
            title: 'Ett oväntat fel inträffade',
            description: 'Försök ladda om sidan',
            variant: 'destructive',
          });
        }
      }
    };

    loadMessages();

    // Stäng gamla kanalen innan ny skapas
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Sätt upp real-time prenumeration
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          if (!isMountedRef.current) return;

          // Hämta sender_name från profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender_name: profile?.name || 'Okänd',
            content: payload.new.content,
            created_at: payload.new.created_at,
            mentions: payload.new.mentions,
          };

          if (isMountedRef.current) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Debounced markAsRead
    if (markAsReadTimeoutRef.current) {
      clearTimeout(markAsReadTimeoutRef.current);
    }
    markAsReadTimeoutRef.current = setTimeout(async () => {
      if (user?.id) {
        try {
          await supabase
            .from('read_states')
            .upsert(
              {
                conversation_id: channelId,
                user_id: user.id,
                last_read_at: new Date().toISOString(),
              },
              {
                onConflict: 'conversation_id,user_id',
              }
            );
        } catch (error) {
          console.error('Error marking as read:', error);
        }
      }
    }, 300);

    return () => {
      // Ge pågående requests en chans att slutföras
      setTimeout(() => {
        isMountedRef.current = false;
        abortController.abort();
        
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }

        if (channelRef.current) {
          channelRef.current.unsubscribe();
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }, 100);
    };
  }, [channelId, toast, user?.id]);

  const sendMessage = async (content: string) => {
    if (!currentUser) {
      toast({
        title: 'Kunde inte skicka meddelande',
        description: 'Du måste vara inloggad',
        variant: 'destructive',
      });
      return;
    }

    // För agent-chattar: lägg bara till i-memory meddelande
    if (agentId) {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        sender_id: currentUser.id,
        sender_name: currentUser.name,
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // Simulera agent-svar efter en kort fördröjning
      setTimeout(() => {
        const agentMessage: Message = {
          id: crypto.randomUUID(),
          sender_id: 'agent',
          sender_name: agentName || 'Agent',
          content: 'Tack för ditt meddelande! Jag är en AI-assistent och kan hjälpa dig med olika uppgifter.',
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMessage]);
      }, 1000);
      
      return;
    }

    // För user-to-user chattar: spara i databasen
    if (!channelId) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          sender_id: currentUser.id,
          content,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Kunde inte skicka meddelande',
        description: 'Försök igen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearMessages = async () => {
    // För agent-chattar: rensa bara in-memory meddelanden
    if (agentId) {
      setMessages([]);
      toast({
        title: 'Meddelanden rensade',
      });
      return;
    }

    // För user-to-user chattar: radera från databasen
    if (!channelId) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('channel_id', channelId);

      if (error) throw error;

      setMessages([]);
      toast({
        title: 'Meddelanden rensade',
      });
    } catch (error) {
      console.error('Error clearing messages:', error);
      toast({
        title: 'Kunde inte rensa meddelanden',
        variant: 'destructive',
      });
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const showSuggestedPrompts = agentId && messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader 
        channelId={channelId} 
        channelName={agentName || channelName || otherUserName}
        onClearMessages={handleClearMessages}
        isGroupChannel={isGroupChannel}
      />
      {showSuggestedPrompts ? (
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
        </div>
      ) : (
        <>
          {isLoadingChannel && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              Laddar meddelanden...
            </div>
          )}
          <MessageList messages={messages} isLoading={isLoading} />
        </>
      )}
      <ChatInput
        onSendMessage={sendMessage} 
        disabled={isLoading}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  );
};
