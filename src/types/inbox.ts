export interface InboxMessage {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string;
  body: string;
  status: 'unread' | 'read' | 'archived';
  source: 'blocket' | 'wayke' | 'bytbil' | 'manual' | 'other';
  assigned_to: string | null;
  received_at: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
  starred: boolean;
}
