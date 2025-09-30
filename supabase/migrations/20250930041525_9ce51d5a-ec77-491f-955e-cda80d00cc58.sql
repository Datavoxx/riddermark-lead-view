-- Update RLS policy so users can only see their own claimed leads or unclaimed leads
DROP POLICY IF EXISTS "Anyone can view leads" ON public.leads;

CREATE POLICY "Users can view unclaimed leads or their own claimed leads"
ON public.leads
FOR SELECT
USING (
  claimed = false OR claimed_by = auth.uid()
);

-- Update existing policy for updates to be more explicit
DROP POLICY IF EXISTS "Authenticated users can update leads they own or unclaimed lead" ON public.leads;

CREATE POLICY "Users can update their own claimed leads or claim unclaimed leads"
ON public.leads
FOR UPDATE
USING (
  claimed_by = auth.uid() OR (claimed = false AND claimed_by IS NULL)
);