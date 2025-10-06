-- Fix RLS policy to allow viewing leads with claimed = NULL
DROP POLICY IF EXISTS "Users can view unclaimed leads or their own claimed leads" ON public.leads;

CREATE POLICY "Users can view unclaimed leads or their own claimed leads"
ON public.leads
FOR SELECT
USING (
  (claimed = false) 
  OR (claimed IS NULL) 
  OR (claimed_by = auth.uid())
);