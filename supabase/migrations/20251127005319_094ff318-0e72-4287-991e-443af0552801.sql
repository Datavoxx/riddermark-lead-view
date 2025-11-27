-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own drafts" ON public.email_drafts;

-- Create new policy that allows viewing pending drafts
CREATE POLICY "Users can view pending drafts" 
ON public.email_drafts 
FOR SELECT 
USING (
  status = 'pending' 
  AND (user_id IS NULL OR auth.uid() = user_id)
);