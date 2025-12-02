import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInboxMessages = (userId: string | undefined) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let isActive = true;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('inbox_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'unread');

        if (error) throw error;
        if (!isActive) return;

        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread inbox count:', error);
      }
    };

    fetchUnreadCount();

    // Listen for new messages
    const channel = supabase
      .channel('inbox-unread-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inbox_messages',
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Polling with visibility check
    const interval = setInterval(fetchUnreadCount, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount();
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

  return { unreadCount };
};
