import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Message } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChatContainerProps {
  channelId?: string;
}

export const ChatContainer = ({ channelId }: ChatContainerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Ladda aktuell användare
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
      }
    };
    loadCurrentUser();
  }, []);

  // Ladda meddelanden och sätt upp real-time prenumeration
  useEffect(() => {
    if (!channelId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey(name)
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Kunde inte ladda meddelanden',
          description: error.message,
          variant: 'destructive',
        });
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

      setMessages(formattedMessages);
    };

    loadMessages();

    // Sätt upp real-time prenumeration
    channelRef.current = supabase
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

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelId, toast]);

  const sendMessage = async (content: string) => {
    if (!channelId || !currentUser) {
      toast({
        title: 'Kunde inte skicka meddelande',
        description: 'Du måste vara inloggad',
        variant: 'destructive',
      });
      return;
    }

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

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader channelId={channelId} onClearMessages={handleClearMessages} />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={isLoading}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  );
};
