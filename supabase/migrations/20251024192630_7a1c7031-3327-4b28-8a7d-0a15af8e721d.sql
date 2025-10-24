-- Skapa channels tabell
CREATE TABLE public.channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- RLS policy: Användare kan endast se kanaler för ANDRA användare (inte sin egen)
CREATE POLICY "Users can view channels for other users"
ON public.channels
FOR SELECT
USING (auth.uid() != user_id);

-- Funktion som skapar kanal för ny användare
CREATE OR REPLACE FUNCTION public.create_channel_for_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skapa en kanal för den nya användaren
  INSERT INTO public.channels (user_id, name)
  VALUES (NEW.user_id, COALESCE(NEW.name, NEW.email));
  
  RETURN NEW;
END;
$$;

-- Trigger som körs när en ny profil skapas
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_channel_for_new_user();

-- Seed data: Skapa kanaler för befintliga användare
INSERT INTO public.channels (user_id, name)
SELECT 
  user_id, 
  COALESCE(name, email) as name
FROM public.profiles
ON CONFLICT DO NOTHING;