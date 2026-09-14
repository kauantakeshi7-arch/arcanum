-- =========================================================
-- ARCANUM V2.0 — Covens/Terreiros + Mural de Graças Alcançadas
-- Run this in Supabase Dashboard → SQL Editor → New query.
-- =========================================================

-- ---------- COVENS (grupos por tradição) ----------
-- Tables created before their RLS policies: the covens policy below queries
-- coven_members, so coven_members must already exist when it runs.
create table public.covens (
  id uuid default uuid_generate_v4() primary key,
  name text not null check (char_length(name) between 1 and 60),
  slug text unique not null,
  description text,
  tradition text not null,
  privacy text default 'public' check (privacy in ('public','approval','secret')),
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

create table public.coven_members (
  coven_id uuid references public.covens(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('member','moderator','founder')),
  joined_at timestamptz default now(),
  primary key (coven_id, user_id)
);

alter table public.covens enable row level security;
create policy "Public/approval covens are listable, members see their own" on public.covens
  for select using (
    privacy in ('public','approval')
    or created_by = auth.uid()
    or exists (select 1 from public.coven_members m where m.coven_id = id and m.user_id = auth.uid())
  );
create policy "Authenticated users can create covens" on public.covens
  for insert with check (auth.uid() = created_by);

alter table public.coven_members enable row level security;
create policy "Membership list is publicly readable" on public.coven_members for select using (true);
create policy "Users can join a coven themselves" on public.coven_members for insert with check (auth.uid() = user_id);
create policy "Users can leave a coven themselves" on public.coven_members for delete using (auth.uid() = user_id);

-- ---------- COVEN POSTS (mural restrito aos membros) ----------
create table public.coven_posts (
  id uuid default uuid_generate_v4() primary key,
  coven_id uuid references public.covens(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz default now()
);
alter table public.coven_posts enable row level security;
create policy "Members can read their coven's posts" on public.coven_posts
  for select using (
    exists (select 1 from public.coven_members m where m.coven_id = coven_posts.coven_id and m.user_id = auth.uid())
  );
create policy "Members can post in their coven" on public.coven_posts
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.coven_members m where m.coven_id = coven_posts.coven_id and m.user_id = auth.uid())
  );

-- ---------- MURAL DE GRAÇAS ALCANÇADAS ----------
create table public.gratitude_testimonials (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  guide_name text not null check (char_length(guide_name) between 1 and 80),
  testimony text not null check (char_length(testimony) between 1 and 1000),
  created_at timestamptz default now()
);
alter table public.gratitude_testimonials enable row level security;
create policy "Gratitude wall is publicly readable" on public.gratitude_testimonials for select using (true);
create policy "Users can post their own testimony" on public.gratitude_testimonials for insert with check (auth.uid() = user_id);

create table public.gratitude_flowers (
  testimonial_id uuid references public.gratitude_testimonials(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (testimonial_id, user_id)
);
alter table public.gratitude_flowers enable row level security;
create policy "Flowers are publicly readable" on public.gratitude_flowers for select using (true);
create policy "Users can send their own flower" on public.gratitude_flowers for insert with check (auth.uid() = user_id);

-- ---------- Views (counts + author name pre-joined, avoids embed ambiguity) ----------
create view public.covens_with_counts as
select c.*, coalesce(m.members, 0) as member_count
from public.covens c
left join (select coven_id, count(*) members from public.coven_members group by coven_id) m on m.coven_id = c.id;

create view public.coven_posts_with_author as
select cp.*, p.display_name as author_name
from public.coven_posts cp
left join public.profiles p on p.id = cp.user_id;

create view public.gratitude_with_counts as
select g.*, coalesce(f.flowers, 0) as flowers_count, p.display_name as author_name
from public.gratitude_testimonials g
left join (select testimonial_id, count(*) flowers from public.gratitude_flowers group by testimonial_id) f on f.testimonial_id = g.id
left join public.profiles p on p.id = g.user_id;
