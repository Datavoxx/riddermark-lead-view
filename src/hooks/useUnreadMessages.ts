import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnreadCounts {
  [conversationId: string]: number;
}

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

  useEffect(() => {
    if (!userId) return;

    let isActive = true;

    // Funktion för att hämta unread counts från server via SQL-funktion
    const fetchUnreadCounts = async () => {
      try {
        const { data, error } = await supabase.rpc('get_unread_counts', {
          for_user_id: userId,
        });

        if (error) throw error;
        if (!isActive) return;

        const counts: UnreadCounts = {};
        data?.forEach((row: { conversation_id: string; unread_count: number }) => {
          counts[row.conversation_id] = Number(row.unread_count);
        });

        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    // Initial fetch
    fetchUnreadCounts();

    // Lyssna på nya meddelanden för optimistiska updates
    const channel = supabase
      .channel('unread-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const message = payload.new as any;
          
          // Optimistisk update: öka räknaren om meddelandet inte är från mig
          if (message.sender_id !== userId) {
            setUnreadCounts((prev) => ({
              ...prev,
              [message.channel_id]: (prev[message.channel_id] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    // Polling med visibility check
    const interval = setInterval(fetchUnreadCounts, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCounts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isActive = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (conversationId: string) => {
    if (!userId) return;

    try {
      // Upsertera read_states i databasen
      const { error } = await supabase
        .from('read_states')
        .upsert(
          {
            conversation_id: conversationId,
            user_id: userId,
            last_read_at: new Date().toISOString(),
          },
          {
            onConflict: 'conversation_id,user_id',
          }
        );

      if (error) throw error;

      // Optimistisk update: sätt till 0 lokalt direkt
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return { unreadCounts, markAsRead };
};
