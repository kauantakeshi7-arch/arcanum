-- =========================================================
-- ARCANUM V2.0 — Chat privado (DMs) + Notificações em tempo real
-- Run this in Supabase Dashboard → SQL Editor → New query.
-- =========================================================

-- ---------- CONVERSATIONS ----------
-- user1_id is always the smaller UUID (enforced by the check + by how the
-- app calls getOrCreateConversation), so a pair of users can only ever have
-- one conversation row regardless of who started it.
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user1_id uuid references public.profiles(id) on delete cascade not null,
  user2_id uuid references public.profiles(id) on delete cascade not null,
  last_message text,
  last_message_at timestamptz default now(),
  created_at timestamptz default now(),
  check (user1_id < user2_id),
  unique (user1_id, user2_id)
);
alter table public.conversations enable row level security;
create policy "Participants can read their conversations" on public.conversations
  for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Participants can create a conversation" on public.conversations
  for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "Participants can update their conversation" on public.conversations
  for update using (auth.uid() = user1_id or auth.uid() = user2_id);

-- ---------- DIRECT MESSAGES ----------
create table public.direct_messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 2000),
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.direct_messages enable row level security;
create policy "Participants can read their messages" on public.direct_messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
    )
  );
create policy "Participants can send messages as themselves" on public.direct_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
    )
  );
create policy "Recipients can mark messages read" on public.direct_messages
  for update using (
    auth.uid() != sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (auth.uid() = c.user1_id or auth.uid() = c.user2_id)
    )
  );

-- ---------- NOTIFICATIONS ----------
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('like','comment','candle_light','message','connection')),
  target_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);
alter table public.notifications enable row level security;
create policy "Users can read their own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Any authenticated actor can notify another user" on public.notifications
  for insert with check (auth.uid() = actor_id);
create policy "Users can mark their own notifications read" on public.notifications
  for update using (auth.uid() = user_id);

-- Enable Realtime on these so the app can subscribe to live inserts.
alter publication supabase_realtime add table public.direct_messages;
alter publication supabase_realtime add table public.notifications;
