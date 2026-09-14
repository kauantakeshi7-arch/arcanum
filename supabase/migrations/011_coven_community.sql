-- =========================================================
-- ARCANUM — Comunidades de Coven mais ricas
-- Mural com foto/curtida/comentário, membros com papéis e
-- moderação, identidade editável pelo fundador.
-- =========================================================

-- ---------- MURAL: foto, curtidas, comentários ----------
alter table public.coven_posts add column if not exists media_url text;

create table public.coven_post_likes (
  post_id uuid references public.coven_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table public.coven_post_likes enable row level security;
create policy "Membros veem curtidas do mural" on public.coven_post_likes
  for select using (
    exists (select 1 from public.coven_posts cp join public.coven_members m on m.coven_id = cp.coven_id and m.user_id = auth.uid() where cp.id = post_id)
  );
create policy "Membros curtem por conta própria" on public.coven_post_likes
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.coven_posts cp join public.coven_members m on m.coven_id = cp.coven_id and m.user_id = auth.uid() where cp.id = post_id)
  );
create policy "Membros descurtem por conta própria" on public.coven_post_likes
  for delete using (auth.uid() = user_id);

create table public.coven_post_comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.coven_posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz default now()
);
alter table public.coven_post_comments enable row level security;
create policy "Membros leem comentários do mural" on public.coven_post_comments
  for select using (
    exists (select 1 from public.coven_posts cp join public.coven_members m on m.coven_id = cp.coven_id and m.user_id = auth.uid() where cp.id = post_id)
  );
create policy "Membros comentam por conta própria" on public.coven_post_comments
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from public.coven_posts cp join public.coven_members m on m.coven_id = cp.coven_id and m.user_id = auth.uid() where cp.id = post_id)
  );

drop view if exists public.coven_posts_with_author;
create view public.coven_posts_with_author as
select cp.*, p.display_name as author_name,
  coalesce(l.likes, 0) as likes_count,
  coalesce(c.comments, 0) as comments_count
from public.coven_posts cp
left join public.profiles p on p.id = cp.user_id
left join (select post_id, count(*) likes from public.coven_post_likes group by post_id) l on l.post_id = cp.id
left join (select post_id, count(*) comments from public.coven_post_comments group by post_id) c on c.post_id = cp.id;

create view public.coven_post_comments_with_author as
select cc.*, p.display_name as author_name
from public.coven_post_comments cc
left join public.profiles p on p.id = cc.user_id;

-- ---------- MEMBROS E MODERAÇÃO ----------
-- (coven_members.role já existia: 'member' | 'moderator' | 'founder')
create policy "Fundadores mudam papel de membros" on public.coven_members
  for update using (
    exists (select 1 from public.coven_members f where f.coven_id = coven_members.coven_id and f.user_id = auth.uid() and f.role = 'founder')
  ) with check (role in ('member','moderator'));

create policy "Fundadores e moderadores removem membros" on public.coven_members
  for delete using (
    role <> 'founder'
    and exists (select 1 from public.coven_members mgr where mgr.coven_id = coven_members.coven_id and mgr.user_id = auth.uid() and mgr.role in ('founder','moderator'))
  );

create view public.coven_members_with_profile as
select cm.*, p.display_name, p.is_verified
from public.coven_members cm
join public.profiles p on p.id = cm.user_id;

-- ---------- IDENTIDADE DO COVEN ----------
alter table public.covens add column if not exists pinned_announcement text
  check (pinned_announcement is null or char_length(pinned_announcement) <= 300);

create policy "Fundadores editam o próprio coven" on public.covens
  for update using (created_by = auth.uid());

-- A view covens_with_counts foi criada (migração 003) com "select c.*" antes
-- de pinned_announcement existir. No Postgres, "c.*" numa view fica travado
-- na lista de colunas do momento da criação — colunas adicionadas depois na
-- tabela não aparecem sozinhas na view. Recriar é obrigatório.
drop view if exists public.covens_with_counts;
create view public.covens_with_counts as
select c.*, coalesce(m.members, 0) as member_count
from public.covens c
left join (select coven_id, count(*) members from public.coven_members group by coven_id) m on m.coven_id = c.id;
