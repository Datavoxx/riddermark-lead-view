import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ImapEmail {
  uid: number;
  subject: string;
  from: string;
  fromName: string | null;
  date: string;
  snippet: string;
  seen: boolean;
  body?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
  cc?: string;
  bcc?: string;
}

export function useEmailClient() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchEmails = useCallback(async (limit = 50): Promise<ImapEmail[]> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Inte inloggad');
      }

      const response = await fetch(
        `https://fjqsaixszaqceviqwboz.supabase.co/functions/v1/api-mail-inbox?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunde inte hämta emails');
      }

      const data = await response.json();
      return data.emails || [];
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmailByUid = useCallback(async (uid: number): Promise<ImapEmail | null> => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Inte inloggad');
      }

      const response = await fetch(
        `https://fjqsaixszaqceviqwboz.supabase.co/functions/v1/api-mail-inbox?uid=${uid}`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunde inte hämta email');
      }

      const data = await response.json();
      return data.email || null;
    } catch (error: any) {
      console.error('Error fetching email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (params: SendEmailParams): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Inte inloggad');
      }

      const response = await fetch(
        'https://fjqsaixszaqceviqwboz.supabase.co/functions/v1/api-mail-send',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kunde inte skicka email');
      }

      return true;
    } catch (error: any) {
      console.error('Error sending email:', error);
      throw error;
    }
  }, []);

  const syncEmails = useCallback(async (limit = 50) => {
    setSyncing(true);
    try {
      const emails = await fetchEmails(limit);
      
      // Cache emails to inbox_messages table for quick access
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return emails;

      for (const email of emails) {
        await supabase
          .from('inbox_messages')
          .upsert({
            id: `imap-${email.uid}`,
            from_email: email.from,
            from_name: email.fromName,
            subject: email.subject,
            body: email.snippet || '',
            status: email.seen ? 'read' : 'unread',
            source: 'other',
            received_at: email.date,
            metadata: { imap_uid: email.uid },
          }, { onConflict: 'id' });
      }

      toast.success(`Synkade ${emails.length} emails`);
      return emails;
    } catch (error: any) {
      toast.error(error.message || 'Kunde inte synka emails');
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [fetchEmails]);

  return {
    loading,
    syncing,
    fetchEmails,
    fetchEmailByUid,
    sendEmail,
    syncEmails,
  };
}
