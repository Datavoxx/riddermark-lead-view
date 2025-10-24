-- Lägg till INSERT policy för channels (endast system kan skapa via trigger)
CREATE POLICY "System can insert channels"
ON public.channels
FOR INSERT
WITH CHECK (false);

-- Lägg till UPDATE policy för channels (ingen ska kunna uppdatera direkt)
CREATE POLICY "No one can update channels"
ON public.channels
FOR UPDATE
USING (false);

-- Lägg till DELETE policy för channels (ingen ska kunna ta bort direkt)
CREATE POLICY "No one can delete channels"
ON public.channels
FOR DELETE
USING (false);