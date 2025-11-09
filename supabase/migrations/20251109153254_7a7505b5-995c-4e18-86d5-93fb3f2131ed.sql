-- Skapa security definer-funktionen för att kontrollera kanalmedlemskap
create or replace function public.is_channel_participant(_channel_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.channel_participants
    where channel_id = _channel_id
      and user_id = _user_id
  )
$$;

-- Ta bort den gamla rekursiva policyn
drop policy if exists "Users can view participants in their channels" on public.channel_participants;

-- Skapa en ny policy som använder funktionen (ej rekursiv)
create policy "Users can view participants in their channels"
on public.channel_participants
for select
using (public.is_channel_participant(channel_id, auth.uid()));