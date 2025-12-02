-- Create inbox_messages table
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  source TEXT NOT NULL DEFAULT 'other' CHECK (source IN ('blocket', 'wayke', 'bytbil', 'manual', 'other')),
  assigned_to UUID,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view all inbox messages"
ON public.inbox_messages
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert inbox messages"
ON public.inbox_messages
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update inbox messages"
ON public.inbox_messages
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete inbox messages"
ON public.inbox_messages
FOR DELETE
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_inbox_messages_updated_at
BEFORE UPDATE ON public.inbox_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER TABLE public.inbox_messages REPLICA IDENTITY FULL;