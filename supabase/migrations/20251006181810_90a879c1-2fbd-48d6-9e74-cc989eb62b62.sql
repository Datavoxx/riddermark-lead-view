-- Add claimed_by_name column to leads table
ALTER TABLE public.leads 
ADD COLUMN claimed_by_name text;

-- Add comment to explain the column
COMMENT ON COLUMN public.leads.claimed_by_name IS 'Name of the user who claimed the lead, fetched from profiles.name';