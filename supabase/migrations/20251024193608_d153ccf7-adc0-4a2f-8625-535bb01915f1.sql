-- Ta bort gamla channels-systemet
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP FUNCTION IF EXISTS public.create_channel_for_new_user();
DROP TABLE IF EXISTS public.channels CASCADE;

-- Skapa conversations-tabell för privata 1-1 konversationer
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  participant_2_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id),
  UNIQUE(participant_1_id, participant_2_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policy: Användare kan se konversationer de är med i
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

-- Funktion för att skapa/hitta en konversation mellan två användare
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  user1_id uuid,
  user2_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id uuid;
  p1_id uuid;
  p2_id uuid;
BEGIN
  -- Sortera user_ids så att vi alltid har samma ordning
  IF user1_id < user2_id THEN
    p1_id := user1_id;
    p2_id := user2_id;
  ELSE
    p1_id := user2_id;
    p2_id := user1_id;
  END IF;
  
  -- Försök hitta befintlig konversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE participant_1_id = p1_id AND participant_2_id = p2_id;
  
  -- Om ingen finns, skapa en ny
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (p1_id, p2_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Skapa konversationer för alla befintliga användarkombinationer
INSERT INTO public.conversations (participant_1_id, participant_2_id)
SELECT 
  LEAST(p1.user_id, p2.user_id) as participant_1_id,
  GREATEST(p1.user_id, p2.user_id) as participant_2_id
FROM public.profiles p1
CROSS JOIN public.profiles p2
WHERE p1.user_id != p2.user_id
  AND LEAST(p1.user_id, p2.user_id) < GREATEST(p1.user_id, p2.user_id)
ON CONFLICT DO NOTHING;

-- Aktivera real-time för conversations
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;