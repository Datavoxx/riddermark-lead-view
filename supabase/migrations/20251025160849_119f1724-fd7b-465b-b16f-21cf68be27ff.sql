-- Fas 1: Server-driven unread state
-- Skapa read_states tabell för att spåra vad användare har läst
create table if not exists public.read_states (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null,
  last_read_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

-- Enable RLS på read_states
alter table public.read_states enable row level security;

-- RLS policies: användare kan bara se/ändra sin egen read state
create policy "Users can view their own read state"
on public.read_states
for select
using (auth.uid() = user_id);

create policy "Users can insert their own read state"
on public.read_states
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own read state"
on public.read_states
for update
using (auth.uid() = user_id);

-- Funktion för att hämta unread counts för en användare
create or replace function public.get_unread_counts(for_user_id uuid)
returns table (conversation_id uuid, unread_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as conversation_id,
    count(m.id) as unread_count
  from conversations c
  left join read_states rs 
    on rs.conversation_id = c.id and rs.user_id = for_user_id
  left join messages m 
    on m.channel_id = c.id::text
    and m.sender_id != for_user_id
    and m.created_at > coalesce(rs.last_read_at, '1970-01-01'::timestamptz)
  where (c.participant_1_id = for_user_id or c.participant_2_id = for_user_id)
  group by c.id;
$$;