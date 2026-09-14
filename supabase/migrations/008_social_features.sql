-- =========================================================
-- ARCANUM — Perfil público, Seguir, Bloquear/Denunciar,
-- Convites e Selo de Verificado
-- =========================================================

-- ---------- SEGUIR ----------
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.follows enable row level security;
create policy "Relações de seguir são públicas" on public.follows for select using (true);
create policy "Usuários seguem por conta própria" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Usuários deixam de seguir por conta própria" on public.follows
  for delete using (auth.uid() = follower_id);

-- ---------- BLOQUEAR ----------
-- Bloqueios ficam privados: só o próprio bloqueador precisa saber quem bloqueou.
create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;
create policy "Usuários veem seus próprios bloqueios" on public.blocks
  for select using (auth.uid() = blocker_id);
create policy "Usuários bloqueiam por conta própria" on public.blocks
  for insert with check (auth.uid() = blocker_id);
create policy "Usuários desbloqueiam por conta própria" on public.blocks
  for delete using (auth.uid() = blocker_id);

-- ---------- DENUNCIAR ----------
-- Só o autor da denúncia pode inserir/ler a própria denúncia; moderação é
-- feita manualmente pela equipe direto no banco por enquanto.
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  target_type text not null check (target_type in ('post','profile','comment','coven_post')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 1 and 500),
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
create policy "Usuários veem suas próprias denúncias" on public.reports
  for select using (auth.uid() = reporter_id);
create policy "Usuários denunciam por conta própria" on public.reports
  for insert with check (auth.uid() = reporter_id);

-- ---------- CONVITES ----------
alter table public.profiles add column if not exists referred_by uuid references public.profiles(id) on delete set null;

-- ---------- SELO DE VERIFICADO ----------
-- Verificação é feita manualmente pela equipe (update direto no banco),
-- sem autosserviço, para preservar a credibilidade do selo.
alter table public.profiles add column if not exists is_verified boolean default false;
