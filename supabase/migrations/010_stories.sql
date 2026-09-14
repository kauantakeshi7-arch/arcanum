-- =========================================================
-- ARCANUM — Stories reais (topo da Ágora)
-- Fotos/textos que expiram em 24h, com registro de quem já viu.
-- =========================================================

create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  media_url text,
  text_content text check (text_content is null or char_length(text_content) <= 180),
  bg_color text,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours'),
  check (media_url is not null or text_content is not null)
);
alter table public.stories enable row level security;
create policy "Stories ativas são públicas" on public.stories
  for select using (true);
create policy "Usuários publicam stories por conta própria" on public.stories
  for insert with check (auth.uid() = user_id);
create policy "Usuários apagam suas próprias stories" on public.stories
  for delete using (auth.uid() = user_id);

create table public.story_views (
  story_id uuid references public.stories(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete cascade not null,
  viewed_at timestamptz default now(),
  primary key (story_id, viewer_id)
);
alter table public.story_views enable row level security;
create policy "Usuários veem suas próprias visualizações" on public.story_views
  for select using (auth.uid() = viewer_id);
create policy "Donos veem quem visualizou a própria story" on public.story_views
  for select using (
    exists (select 1 from public.stories s where s.id = story_id and s.user_id = auth.uid())
  );
create policy "Usuários registram visualização por conta própria" on public.story_views
  for insert with check (auth.uid() = viewer_id);
