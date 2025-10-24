import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnreadCounts {
  [conversationId: string]: number;
}

export const useUnreadMessages = (userId: string | undefined) => {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({});

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCounts = async () => {
      try {
        // Hämta alla konversationer för användaren
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

        if (!conversations || conversations.length === 0) {
          setUnreadCounts({});
          return;
        }

        const counts: UnreadCounts = {};

        // Räkna olästa meddelanden för varje konversation
        for (const conv of conversations) {
          const lastVisit = localStorage.getItem(`last-visit-${conv.id}`);
          const lastVisitTime = lastVisit || new Date(0).toISOString();

          const { data: messages } = await supabase
            .from('messages')
            .select('id')
            .eq('channel_id', conv.id)
            .neq('sender_id', userId)
            .gt('created_at', lastVisitTime);

          counts[conv.id] = messages?.length || 0;
        }

        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts();

    // Real-time subscription för nya meddelanden
    const channel = supabase
      .channel('messages-unread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    // Intervall för att uppdatera räknare
    const interval = setInterval(fetchUnreadCounts, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId]);

  const markAsRead = (conversationId: string) => {
    localStorage.setItem(`last-visit-${conversationId}`, new Date().toISOString());
    setUnreadCounts(prev => ({ ...prev, [conversationId]: 0 }));
  };

  return { unreadCounts, markAsRead };
};
