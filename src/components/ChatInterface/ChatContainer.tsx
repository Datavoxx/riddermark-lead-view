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
    // För agent-chattar: använd agent-specifik channel ID
    const effectiveChannelId = agentId && currentUser 
      ? `agent-${agentId}-${currentUser.id}` 
      : channelId;
    
    if (!effectiveChannelId) return;

    let cancelled = false;
    setIsLoadingChannel(true);

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            profiles!messages_sender_id_fkey(name)
          `)
          .eq('channel_id', effectiveChannelId)
          .order('created_at', { ascending: true });

        if (cancelled) return;

        if (error) {
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
          sender_name: msg.sender_id === '00000000-0000-0000-0000-000000000001' 
            ? (agentName || 'Agent')
            : (msg.profiles?.name || 'Okänd'),
          content: msg.content,
          created_at: msg.created_at,
          mentions: msg.mentions,
        }));

        setMessages(formattedMessages);
        setIsLoadingChannel(false);
      } catch (err: any) {
        if (cancelled) return;
        
        console.error('Unexpected error loading messages:', err);
        setIsLoadingChannel(false);
        toast({
          title: 'Ett oväntat fel inträffade',
          description: 'Försök ladda om sidan',
          variant: 'destructive',
        });
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
      .channel(`messages:${effectiveChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${effectiveChannelId}`,
        },
        async (payload) => {
          if (cancelled) return;

          let senderName = 'Okänd';
          
          // För agent-meddelanden använd agentName
          if (payload.new.sender_id === '00000000-0000-0000-0000-000000000001') {
            senderName = agentName || 'Agent';
          } else {
            // Hämta sender_name från profiles för vanliga användare
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', payload.new.sender_id)
              .single();
            
            senderName = profile?.name || 'Okänd';
          }

          const newMessage: Message = {
            id: payload.new.id,
            sender_id: payload.new.sender_id,
            sender_name: senderName,
            content: payload.new.content,
            created_at: payload.new.created_at,
            mentions: payload.new.mentions,
          };

          if (!cancelled) {
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
      if (user?.id && effectiveChannelId) {
        try {
          await supabase
            .from('read_states')
            .upsert(
              {
                conversation_id: effectiveChannelId,
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
      cancelled = true;
      
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }

      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [channelId, agentId, agentName, currentUser, toast, user?.id]);

  const sendMessage = async (content: string) => {
    if (!currentUser) {
      toast({
        title: 'Kunde inte skicka meddelande',
        description: 'Du måste vara inloggad',
        variant: 'destructive',
      });
      return;
    }

    // För agent-chattar: skicka till edge function som hanterar allt
    if (agentId) {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('agent-chat', {
          body: { 
            message: content,
            userId: currentUser.id,
            agentId: agentId
          }
        });

        if (error) throw error;

        // Meddelanden kommer via real-time subscription, ingen manuell tillägg
        toast({
          title: 'Meddelande skickat',
          description: 'Väntar på svar från agenten...',
        });
      } catch (error) {
        console.error('Error calling agent:', error);
        toast({
          title: 'Kunde inte skicka meddelande',
          description: 'Försök igen.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
      
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
    // Bestäm vilken channel ID som ska användas
    const effectiveChannelId = agentId && currentUser 
      ? `agent-${agentId}-${currentUser.id}` 
      : channelId;
    
    if (!effectiveChannelId) return;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('channel_id', effectiveChannelId);

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
          <MessageList messages={messages} isLoading={isLoading} isLoadingChannel={isLoadingChannel} />
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
