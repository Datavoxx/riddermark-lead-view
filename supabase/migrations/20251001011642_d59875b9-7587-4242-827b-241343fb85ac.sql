-- Enable realtime for email_drafts table
ALTER TABLE public.email_drafts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_drafts;