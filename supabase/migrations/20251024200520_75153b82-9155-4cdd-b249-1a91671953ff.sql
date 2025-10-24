-- Funktion för att skapa conversations när en ny användare läggs till
CREATE OR REPLACE FUNCTION public.handle_new_user_conversations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_user RECORD;
  p1_id uuid;
  p2_id uuid;
BEGIN
  -- För varje befintlig användare (utom den nya)
  FOR existing_user IN 
    SELECT user_id FROM public.profiles WHERE user_id != NEW.user_id
  LOOP
    -- Sortera participant_ids så att participant_1_id < participant_2_id
    IF NEW.user_id < existing_user.user_id THEN
      p1_id := NEW.user_id;
      p2_id := existing_user.user_id;
    ELSE
      p1_id := existing_user.user_id;
      p2_id := NEW.user_id;
    END IF;
    
    -- Skapa conversation (om den inte redan finns)
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (p1_id, p2_id)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Trigger som körs när en ny profil skapas
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_conversations();

-- Skapa de saknade conversations för mahir manuellt
-- (baserat på user_ids från tidigare query: mahir=4 möter alex=1, mahad=2, phille=3)
DO $$
DECLARE
  mahir_id uuid;
  alex_id uuid;
  mahad_id uuid;
  phille_id uuid;
BEGIN
  -- Hämta user_ids
  SELECT user_id INTO mahir_id FROM public.profiles WHERE name = 'mahir';
  SELECT user_id INTO alex_id FROM public.profiles WHERE name = 'alex';
  SELECT user_id INTO mahad_id FROM public.profiles WHERE name = 'mahad';
  SELECT user_id INTO phille_id FROM public.profiles WHERE name = 'Phille';
  
  -- Skapa conversations med rätt sortering
  IF mahir_id IS NOT NULL AND alex_id IS NOT NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (LEAST(mahir_id, alex_id), GREATEST(mahir_id, alex_id))
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF mahir_id IS NOT NULL AND mahad_id IS NOT NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (LEAST(mahir_id, mahad_id), GREATEST(mahir_id, mahad_id))
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF mahir_id IS NOT NULL AND phille_id IS NOT NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (LEAST(mahir_id, phille_id), GREATEST(mahir_id, phille_id))
    ON CONFLICT DO NOTHING;
  END IF;
END $$;