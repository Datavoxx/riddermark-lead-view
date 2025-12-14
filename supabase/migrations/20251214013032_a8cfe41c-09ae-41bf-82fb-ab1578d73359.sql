-- Add CRM fields to leads table
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS crm_status text DEFAULT 'new_callback';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS crm_stage text DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS deal_value integer DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_channel text DEFAULT 'blocket';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now();
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lost_reason text DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone DEFAULT NULL;

-- Add index for CRM queries
CREATE INDEX IF NOT EXISTS idx_leads_crm_status ON public.leads(crm_status);
CREATE INDEX IF NOT EXISTS idx_leads_claimed_crm ON public.leads(claimed, crm_status);