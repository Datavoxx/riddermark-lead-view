-- Create workshop_entries table
CREATE TABLE public.workshop_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  workshop_name TEXT NOT NULL,
  workshop_address TEXT,
  workshop_place_id TEXT,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'in_workshop',
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workshop_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own workshop entries"
  ON public.workshop_entries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workshop entries"
  ON public.workshop_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workshop entries"
  ON public.workshop_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workshop entries"
  ON public.workshop_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_workshop_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_workshop_entries_updated_at
  BEFORE UPDATE ON public.workshop_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workshop_entries_updated_at();

-- Create index for better performance
CREATE INDEX idx_workshop_entries_user_id ON public.workshop_entries(user_id);
CREATE INDEX idx_workshop_entries_car_id ON public.workshop_entries(car_id);
CREATE INDEX idx_workshop_entries_status ON public.workshop_entries(status);