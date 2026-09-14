-- =========================================================
-- ARCANUM — Supabase schema (Postgres)
-- =========================================================
-- Run this in Supabase Dashboard → SQL Editor → New query.
--
-- IMPORTANT — what changed vs. the original dossier schema:
-- 1. Row Level Security (RLS) is enabled on every table. Without it,
--    ANY holder of the public anon key (i.e. anyone who opens the site)
--    can read and write every row in every table. RLS is not optional
--    for a Supabase app that ships its anon key to the browser.
-- 2. `blessings_count` / `reposts_count` / `lights_count` as bare
--    integers can't safely support "toggle my like/undo my like" for
--    multiple concurrent users — two people liking at once can race
--    and lose an increment, and there's no way to know whether *you*
--    already liked something. Fixed with join tables (post_likes,
--    candle_lights) and counts derived via COUNT(*), which is both
--    race-safe and lets the UI show "you already lit this candle".
-- 3. Added `post_comments`, which the original schema didn't have at
--    all, even though the product spec calls for comments.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_layers jsonb default '{"robe":"novice","aura":"none","familiar":"egg","item":"candle"}',
  bio text,
  religion_path text not null default 'solitario',
  path_badge text default 'default_sigil',
  initiation_grade int default 1,
  mana_xp int default 0,
  streak_days int default 0,
  logged_today_at date,
  sun_sign text,
  moon_sign text,
  ascendant_sign text,
  is_vip boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- ---------- POSTS ----------
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  religion_path text,
  type text default 'text' check (type in ('text','altar_photo','oracle_reading')),
  content text,
  media_urls text[],
  oracle_cards text[],
  created_at timestamptz default now()
);
alter table public.posts enable row level security;
create policy "Posts are publicly readable" on public.posts for select using (true);
create policy "Users can create their own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

-- ---------- POST LIKES ("Abençoado Seja / Axé") ----------
create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table public.post_likes enable row level security;
create policy "Likes are publicly readable" on public.post_likes for select using (true);
create policy "Users can like as themselves" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike their own like" on public.post_likes for delete using (auth.uid() = user_id);

-- ---------- POST COMMENTS ----------
create table public.post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz default now()
);
alter table public.post_comments enable row level security;
create policy "Comments are publicly readable" on public.post_comments for select using (true);
create policy "Users can comment as themselves" on public.post_comments for insert with check (auth.uid() = user_id);

-- ---------- GRIMOIRE (private diary) ----------
create table public.grimoire_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_type text default 'dream' check (entry_type in ('dream','ritual','meditation','tarot')),
  title text not null,
  content text not null,
  is_private boolean default true,
  created_at timestamptz default now()
);
alter table public.grimoire_entries enable row level security;
-- Grimoire entries are private by default: only the author can read their own.
create policy "Users can read their own grimoire" on public.grimoire_entries for select using (auth.uid() = user_id);
create policy "Users can write their own grimoire" on public.grimoire_entries for insert with check (auth.uid() = user_id);

-- ---------- PRAYER CANDLES (Mural de Firmezas) ----------
create table public.prayer_candles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  intention text not null check (char_length(intention) between 1 and 300),
  expires_at timestamptz default (now() + interval '48 hours'),
  created_at timestamptz default now()
);
alter table public.prayer_candles enable row level security;
create policy "Candles are publicly readable" on public.prayer_candles for select using (true);
create policy "Users can light their own candle" on public.prayer_candles for insert with check (auth.uid() = user_id);

create table public.candle_lights (
  candle_id uuid references public.prayer_candles(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (candle_id, user_id)
);
alter table public.candle_lights enable row level security;
create policy "Candle lights are publicly readable" on public.candle_lights for select using (true);
create policy "Users can firm their own light" on public.candle_lights for insert with check (auth.uid() = user_id);

-- ---------- Helpful views (derived counts, race-safe) ----------
create view public.posts_with_counts as
select
  p.*,
  coalesce(l.likes, 0) as blessings_count,
  coalesce(c.comments, 0) as comments_count
from public.posts p
left join (select post_id, count(*) likes from public.post_likes group by post_id) l on l.post_id = p.id
left join (select post_id, count(*) comments from public.post_comments group by post_id) c on c.post_id = p.id;

create view public.candles_with_counts as
select
  pc.*,
  coalesce(cl.lights, 0) as lights_count
from public.prayer_candles pc
left join (select candle_id, count(*) lights from public.candle_lights group by candle_id) cl on cl.candle_id = pc.id;
