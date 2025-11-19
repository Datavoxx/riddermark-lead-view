-- Create cars table
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marke_modell TEXT NOT NULL,
  arsmodell INTEGER NOT NULL,
  regnr TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all cars"
  ON public.cars
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own cars"
  ON public.cars
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars"
  ON public.cars
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars"
  ON public.cars
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_cars_user_id ON public.cars(user_id);
CREATE INDEX idx_cars_regnr ON public.cars(regnr);