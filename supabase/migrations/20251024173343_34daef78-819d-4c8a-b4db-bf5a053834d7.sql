-- Ta bort befintlig foreign key constraint
ALTER TABLE public.leads
DROP CONSTRAINT IF EXISTS leads_claimed_by_fkey;

-- Lägg till ny foreign key constraint med ON DELETE SET NULL
ALTER TABLE public.leads
ADD CONSTRAINT leads_claimed_by_fkey
FOREIGN KEY (claimed_by)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Skapa funktion som automatiskt sätter claimed = false när claimed_by blir NULL
CREATE OR REPLACE FUNCTION public.handle_unclaim_on_user_delete()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.claimed_by IS NULL AND OLD.claimed_by IS NOT NULL THEN
    NEW.claimed = false;
  END IF;
  RETURN NEW;
END;
$$;

-- Ta bort trigger om den finns
DROP TRIGGER IF EXISTS unclaim_lead_on_user_delete ON public.leads;

-- Skapa trigger som kör funktionen när leads uppdateras
CREATE TRIGGER unclaim_lead_on_user_delete
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_unclaim_on_user_delete();