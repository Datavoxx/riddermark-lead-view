-- Skapa tabell för gruppchatter
CREATE TABLE public.group_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Skapa tabell för kanaldeltagare
CREATE TABLE public.channel_participants (
  channel_id UUID NOT NULL REFERENCES public.group_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

-- Enable RLS för group_channels
ALTER TABLE public.group_channels ENABLE ROW LEVEL SECURITY;

-- Enable RLS för channel_participants
ALTER TABLE public.channel_participants ENABLE ROW LEVEL SECURITY;

-- RLS: Användare kan se gruppchatter de är medlemmar i
CREATE POLICY "Users can view group channels they are members of"
ON public.group_channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.channel_participants
    WHERE channel_participants.channel_id = group_channels.id
    AND channel_participants.user_id = auth.uid()
  )
);

-- RLS: Autentiserade användare kan skapa gruppchatter
CREATE POLICY "Authenticated users can create group channels"
ON public.group_channels FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- RLS: Användare kan se deltagare i kanaler de är med i
CREATE POLICY "Users can view participants in their channels"
ON public.channel_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.channel_participants cp
    WHERE cp.channel_id = channel_participants.channel_id
    AND cp.user_id = auth.uid()
  )
);

-- RLS: Användare kan lägga till deltagare när de skapar kanalen
CREATE POLICY "Users can insert participants when creating channel"
ON public.channel_participants FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_channels
    WHERE group_channels.id = channel_participants.channel_id
    AND group_channels.created_by = auth.uid()
  )
);

-- Lägg till realtime för group_channels
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_channels;

-- Lägg till realtime för channel_participants
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_participants;