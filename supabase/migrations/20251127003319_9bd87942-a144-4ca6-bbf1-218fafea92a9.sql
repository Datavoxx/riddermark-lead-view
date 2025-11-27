-- Add user_id column to email_drafts table
ALTER TABLE email_drafts ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update RLS policy to only show drafts for the user who created them
DROP POLICY IF EXISTS read_drafts ON email_drafts;

CREATE POLICY "Users can view their own drafts"
ON email_drafts
FOR SELECT
USING (auth.uid() = user_id);