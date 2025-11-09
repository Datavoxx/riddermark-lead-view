-- Create a security definer function to handle group channel creation
CREATE OR REPLACE FUNCTION public.create_group_channel(
  _name text,
  _participant_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _channel_id uuid;
  _user_id uuid;
  _participant_id uuid;
BEGIN
  -- Get the authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create the channel
  INSERT INTO public.group_channels (name, created_by)
  VALUES (_name, _user_id)
  RETURNING id INTO _channel_id;
  
  -- Add the creator as a participant
  INSERT INTO public.channel_participants (channel_id, user_id)
  VALUES (_channel_id, _user_id);
  
  -- Add other participants
  IF _participant_ids IS NOT NULL AND array_length(_participant_ids, 1) > 0 THEN
    FOREACH _participant_id IN ARRAY _participant_ids
    LOOP
      -- Only add if not the creator (avoid duplicates)
      IF _participant_id != _user_id THEN
        INSERT INTO public.channel_participants (channel_id, user_id)
        VALUES (_channel_id, _participant_id);
      END IF;
    END LOOP;
  END IF;
  
  RETURN _channel_id;
END;
$$;