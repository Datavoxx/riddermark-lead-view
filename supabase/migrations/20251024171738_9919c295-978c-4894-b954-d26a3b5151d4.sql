-- Ta bort gammal foreign key constraint från auth.users
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Lägg till ny foreign key till profiles istället
ALTER TABLE public.messages
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;