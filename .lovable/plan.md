

# Komplett SQL-schema för databasen

Här är hela SQL-schemat för din databas, sammanställt från alla migreringar och typdefinitioner. Du kan köra detta i ett tomt Supabase-projekt för att återskapa hela strukturen.

```sql
-- ============================================================
-- DATAVOX - Komplett databasschema
-- ============================================================

-- =====================
-- 1. ENUMS
-- =====================
CREATE TYPE public.app_role AS ENUM ('admin', 'butikschef', 'säljare', 'blocket_user');

-- =====================
-- 2. UTILITY FUNCTIONS
-- =====================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================
-- 3. TABLES
-- =====================

-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- LEADS
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT,
  blocket_url TEXT,
  summary TEXT,
  summering TEXT,
  lead_namn TEXT,
  lead_email TEXT,
  regnr TEXT,
  link TEXT,
  full_id TEXT,
  message_id TEXT,
  preview_title TEXT,
  preview_description TEXT,
  preview_image_url TEXT,
  resume_url TEXT,
  forval JSONB,
  metadata JSONB,
  claimed BOOLEAN DEFAULT false,
  claimed_by UUID,
  claimed_by_name TEXT,
  claimed_at TIMESTAMPTZ,
  crm_status TEXT DEFAULT 'new_callback',
  crm_stage TEXT,
  deal_value INTEGER,
  source_channel TEXT DEFAULT 'blocket',
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  lost_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT leads_claimed_by_fkey FOREIGN KEY (claimed_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view unclaimed leads or their own claimed leads" ON public.leads FOR SELECT
  USING ((claimed = false) OR (claimed IS NULL) OR (claimed_by = auth.uid()));
CREATE POLICY "Authenticated users can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update their own claimed leads or claim unclaimed leads" ON public.leads FOR UPDATE TO authenticated
  USING (claimed_by = auth.uid() OR (claimed = false AND claimed_by IS NULL));

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_leads_crm_status ON public.leads(crm_status);
CREATE INDEX IF NOT EXISTS idx_leads_claimed_crm ON public.leads(claimed, crm_status);

ALTER TABLE public.leads REPLICA IDENTITY FULL;

-- Trigger: auto-unclaim on user delete
CREATE OR REPLACE FUNCTION public.handle_unclaim_on_user_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.claimed_by IS NULL AND OLD.claimed_by IS NOT NULL THEN
    NEW.claimed = false;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER unclaim_lead_on_user_delete
  BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_unclaim_on_user_delete();

-- CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id),
  CONSTRAINT ordered_participants CHECK (participant_1_id < participant_2_id),
  UNIQUE(participant_1_id, participant_2_id)
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their conversations" ON public.conversations FOR SELECT
  USING (auth.uid() = participant_1_id OR auth.uid() = participant_2_id);

ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- MESSAGES
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = sender_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);
CREATE POLICY "Channel creators can delete channel messages" ON public.messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.group_channels WHERE id::text = messages.channel_id AND created_by = auth.uid()));

-- READ STATES
CREATE TABLE public.read_states (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.read_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own read state" ON public.read_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own read state" ON public.read_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own read state" ON public.read_states FOR UPDATE USING (auth.uid() = user_id);

-- GROUP CHANNELS
CREATE TABLE public.group_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.group_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group channels they are members of" ON public.group_channels FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.channel_participants WHERE channel_participants.channel_id = group_channels.id AND channel_participants.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create group channels" ON public.group_channels FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Channel creators can update their channels" ON public.group_channels FOR UPDATE TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE POLICY "Channel creators can delete their channels" ON public.group_channels FOR DELETE TO authenticated USING (created_by = auth.uid());

-- CHANNEL PARTICIPANTS
CREATE TABLE public.channel_participants (
  channel_id UUID NOT NULL REFERENCES public.group_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

ALTER TABLE public.channel_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view participants in their channels" ON public.channel_participants FOR SELECT
  USING (public.is_channel_participant(channel_id, auth.uid()));
CREATE POLICY "Users can insert participants when creating channel" ON public.channel_participants FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.group_channels WHERE group_channels.id = channel_participants.channel_id AND group_channels.created_by = auth.uid()));
CREATE POLICY "Channel creators can delete participants" ON public.channel_participants FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.group_channels WHERE id = channel_participants.channel_id AND created_by = auth.uid()));

-- EMAIL DRAFTS
CREATE TABLE public.email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id TEXT NOT NULL,
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  lead_id UUID,
  resume_url TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pending drafts" ON public.email_drafts FOR SELECT
  USING (status = 'pending' AND (user_id IS NULL OR auth.uid() = user_id));

ALTER TABLE public.email_drafts REPLICA IDENTITY FULL;

-- RECORDINGS
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  duration_ms INTEGER,
  lang TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- TRANSCRIPTS
CREATE TABLE public.transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID REFERENCES public.recordings(id),
  text TEXT NOT NULL,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- REPORT SEQUENCE
CREATE TABLE public.report_sequence (
  id SERIAL PRIMARY KEY,
  message_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CARS
CREATE TABLE public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marke_modell TEXT NOT NULL,
  arsmodell INTEGER NOT NULL,
  regnr TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all cars" ON public.cars FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own cars" ON public.cars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cars" ON public.cars FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cars" ON public.cars FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cars_user_id ON public.cars(user_id);
CREATE INDEX idx_cars_regnr ON public.cars(regnr);

-- WORKSHOP ENTRIES
CREATE TABLE public.workshop_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  workshop_name TEXT NOT NULL,
  workshop_address TEXT,
  workshop_place_id TEXT,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'in_workshop',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workshop_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workshop entries" ON public.workshop_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workshop entries" ON public.workshop_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workshop entries" ON public.workshop_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workshop entries" ON public.workshop_entries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_workshop_entries_updated_at BEFORE UPDATE ON public.workshop_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_workshop_entries_user_id ON public.workshop_entries(user_id);
CREATE INDEX idx_workshop_entries_car_id ON public.workshop_entries(car_id);
CREATE INDEX idx_workshop_entries_status ON public.workshop_entries(status);

-- NOTIFICATIONS
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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- INBOX MESSAGES
CREATE TABLE public.inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  source TEXT NOT NULL DEFAULT 'other' CHECK (source IN ('blocket', 'wayke', 'bytbil', 'manual', 'other')),
  assigned_to UUID,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all inbox messages" ON public.inbox_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert inbox messages" ON public.inbox_messages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update inbox messages" ON public.inbox_messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete inbox messages" ON public.inbox_messages FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_inbox_messages_updated_at BEFORE UPDATE ON public.inbox_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.inbox_messages REPLICA IDENTITY FULL;

-- FOLLOW UP REMINDERS
CREATE TABLE public.follow_up_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  remind_at TIMESTAMPTZ NOT NULL,
  sent_email_text TEXT,
  original_message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders" ON public.follow_up_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminders" ON public.follow_up_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminders" ON public.follow_up_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminders" ON public.follow_up_reminders FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_follow_up_reminders_remind_at ON public.follow_up_reminders(remind_at) WHERE status = 'pending';

-- =====================
-- 4. FUNCTIONS
-- =====================

-- Role checking (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Channel participant checking (security definer)
CREATE OR REPLACE FUNCTION public.is_channel_participant(_channel_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.channel_participants WHERE channel_id = _channel_id AND user_id = _user_id)
$$;

-- Get or create conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  conversation_id UUID; p1_id UUID; p2_id UUID;
BEGIN
  IF user1_id < user2_id THEN p1_id := user1_id; p2_id := user2_id;
  ELSE p1_id := user2_id; p2_id := user1_id; END IF;
  SELECT id INTO conversation_id FROM public.conversations WHERE participant_1_id = p1_id AND participant_2_id = p2_id;
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id) VALUES (p1_id, p2_id) RETURNING id INTO conversation_id;
  END IF;
  RETURN conversation_id;
END;
$$;

-- Get unread counts
CREATE OR REPLACE FUNCTION public.get_unread_counts(for_user_id UUID)
RETURNS TABLE (conversation_id UUID, unread_count BIGINT) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.id AS conversation_id, count(m.id) AS unread_count
  FROM conversations c
  LEFT JOIN read_states rs ON rs.conversation_id = c.id AND rs.user_id = for_user_id
  LEFT JOIN messages m ON m.channel_id = c.id::text AND m.sender_id != for_user_id AND m.created_at > coalesce(rs.last_read_at, '1970-01-01'::timestamptz)
  WHERE (c.participant_1_id = for_user_id OR c.participant_2_id = for_user_id)
  GROUP BY c.id;
$$;

-- Create group channel (security definer)
CREATE OR REPLACE FUNCTION public.create_group_channel(_name TEXT, _participant_ids UUID[])
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _channel_id UUID; _user_id UUID; _participant_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  INSERT INTO public.group_channels (name, created_by) VALUES (_name, _user_id) RETURNING id INTO _channel_id;
  INSERT INTO public.channel_participants (channel_id, user_id) VALUES (_channel_id, _user_id);
  IF _participant_ids IS NOT NULL AND array_length(_participant_ids, 1) > 0 THEN
    FOREACH _participant_id IN ARRAY _participant_ids LOOP
      IF _participant_id != _user_id THEN
        INSERT INTO public.channel_participants (channel_id, user_id) VALUES (_channel_id, _participant_id);
      END IF;
    END LOOP;
  END IF;
  RETURN _channel_id;
END;
$$;

-- =====================
-- 5. TRIGGERS
-- =====================

-- Handle new user registration → create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name, phone_number)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'phone_number');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle new user → create conversations with all existing users
CREATE OR REPLACE FUNCTION public.handle_new_user_conversations()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing_user RECORD; p1_id UUID; p2_id UUID;
BEGIN
  FOR existing_user IN SELECT user_id FROM public.profiles WHERE user_id != NEW.user_id LOOP
    IF NEW.user_id < existing_user.user_id THEN p1_id := NEW.user_id; p2_id := existing_user.user_id;
    ELSE p1_id := existing_user.user_id; p2_id := NEW.user_id; END IF;
    INSERT INTO public.conversations (participant_1_id, participant_2_id) VALUES (p1_id, p2_id) ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_conversations();

-- Notify blocket users on new lead
CREATE OR REPLACE FUNCTION public.notify_blocket_users_on_new_lead()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  SELECT ur.user_id, 'new_lead', 'Nytt ärende inkommit',
    COALESCE(NEW.subject, 'Ett nytt Blocket-ärende har kommit in'), NEW.id, 'lead'
  FROM public.user_roles ur WHERE ur.role = 'blocket_user';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_lead_notify
  AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.notify_blocket_users_on_new_lead();

-- =====================
-- 6. REALTIME PUBLICATIONS
-- =====================
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.email_drafts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =====================
-- 7. STORAGE
-- =====================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('voice-recordings', 'voice-recordings', false, 10485760, ARRAY['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4']);

CREATE POLICY "Authenticated users can upload voice recordings" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can read their own voice recordings" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own voice recordings" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Sammanfattning av tabeller

| Tabell | Syfte |
|--------|-------|
| `profiles` | Användarprofiler (auto-skapad vid registrering) |
| `user_roles` | Roller: admin, butikschef, säljare, blocket_user |
| `leads` | Blocket-ärenden med CRM-fält |
| `conversations` | 1-1 privata konversationer |
| `messages` | Chattmeddelanden (1-1 och grupp) |
| `read_states` | Spårar senast lästa meddelande per konversation |
| `group_channels` | Gruppchatt-kanaler |
| `channel_participants` | Medlemmar i gruppchatter |
| `email_drafts` | AI-genererade e-postutkast |
| `recordings` | Röstinspelningar |
| `transcripts` | Transkriptioner av inspelningar |
| `report_sequence` | Meddelandesekvens för rapporter |
| `cars` | Bilar (märke, årsmodell, regnr) |
| `workshop_entries` | Verkstadsbesök per bil |
| `notifications` | Push-notifikationer per användare |
| `inbox_messages` | E-postinkorg (IMAP-synkad från one.com) |
| `follow_up_reminders` | Påminnelser för uppföljning |

Observera att `recordings`, `transcripts` och `report_sequence` skapades utanför migreringsfilerna (troligen via SQL Editor) och saknar RLS-policies i koden. Du bör kontrollera dessa i Supabase Dashboard.

