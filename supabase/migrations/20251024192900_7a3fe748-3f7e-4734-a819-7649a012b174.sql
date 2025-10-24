-- Aktivera real-time för channels tabellen
ALTER TABLE public.channels REPLICA IDENTITY FULL;

-- Lägg till tabellen i realtime publikation
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;