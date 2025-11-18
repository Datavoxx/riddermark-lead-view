-- Add UPDATE RLS policy for group_channels
CREATE POLICY "Channel creators can update their channels"
ON public.group_channels
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Add DELETE RLS policy for group_channels
CREATE POLICY "Channel creators can delete their channels"
ON public.group_channels
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Add DELETE RLS policy for channel_participants
CREATE POLICY "Channel creators can delete participants"
ON public.channel_participants
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_channels
    WHERE id = channel_participants.channel_id
    AND created_by = auth.uid()
  )
);

-- Add DELETE RLS policy for messages in channels
CREATE POLICY "Channel creators can delete channel messages"
ON public.messages
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_channels
    WHERE id::text = messages.channel_id
    AND created_by = auth.uid()
  )
);