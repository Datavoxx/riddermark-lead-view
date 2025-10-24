import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fjqsaixszaqceviqwboz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcXNhaXhzemFxY2V2aXF3Ym96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4OTM2ODgsImV4cCI6MjA3MzQ2OTY4OH0.ebuIKmXECbUv1L1Y2JhoXmL6pcvFcfvLOpSEggNWhXc";

const supabaseUntyped = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        const { data: conversations } = await supabaseUntyped
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

          const { data: messages } = await supabaseUntyped
            .from('messages')
            .select('id')
            .eq('conversation_id', conv.id)
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
    const channel = supabaseUntyped
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
      supabaseUntyped.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId]);

  const markAsRead = (conversationId: string) => {
    localStorage.setItem(`last-visit-${conversationId}`, new Date().toISOString());
    setUnreadCounts(prev => ({ ...prev, [conversationId]: 0 }));
  };

  return { unreadCounts, markAsRead };
};
