-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create function to notify blocket users on new lead
CREATE OR REPLACE FUNCTION public.notify_blocket_users_on_new_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification for all users with blocket_user role
  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  SELECT 
    ur.user_id,
    'new_lead',
    'Nytt ärende inkommit',
    COALESCE(NEW.subject, 'Ett nytt Blocket-ärende har kommit in'),
    NEW.id,
    'lead'
  FROM public.user_roles ur
  WHERE ur.role = 'blocket_user';
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_new_lead_notify
  AFTER INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_blocket_users_on_new_lead();