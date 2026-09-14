-- =========================================================
-- ARCANUM V2.0 — Passe Lunar (Módulo 7): missões por fase da lua
-- com comprovação obrigatória por foto.
-- =========================================================

create table public.lunar_quests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  required_moon_phase text not null check (required_moon_phase in ('nova','crescente','cheia','minguante')),
  mana_reward int default 100,
  season_month int not null check (season_month between 1 and 12),
  created_at timestamptz default now()
);
alter table public.lunar_quests enable row level security;
create policy "Missões lunares são públicas" on public.lunar_quests for select using (true);

create table public.quest_completions (
  id uuid default uuid_generate_v4() primary key,
  quest_id uuid references public.lunar_quests(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  proof_photo_url text not null,
  shared_to_feed boolean default false,
  completed_at timestamptz default now(),
  unique(quest_id, user_id)
);
alter table public.quest_completions enable row level security;
create policy "Comprovações do Passe Lunar são públicas" on public.quest_completions for select using (true);
create policy "Usuários registram sua própria comprovação" on public.quest_completions
  for insert with check (auth.uid() = user_id);

-- ---------- Seed do ciclo do mês vigente ----------
-- Execute novamente (ajustando os textos se quiser) no início de cada mês
-- para popular o próximo ciclo de 4 missões.
insert into public.lunar_quests (title, description, required_moon_phase, mana_reward, season_month)
values
  ('Semeando Intenções', 'Na Lua Nova, escreva em seu Grimório uma intenção clara para este ciclo e fotografe a página ou seu altar preparado.', 'nova', 80, extract(month from now())::int),
  ('Fortalecendo o Caminho', 'Na Lua Crescente, prepare um banho, defumação ou ritual de fortalecimento e registre com uma foto.', 'crescente', 100, extract(month from now())::int),
  ('Celebrando a Plenitude', 'Na Lua Cheia, firme uma vela ou realize uma oferenda de gratidão — fotografe o momento.', 'cheia', 120, extract(month from now())::int),
  ('Soltando o que Não Serve', 'Na Lua Minguante, faça um descarrego ou limpeza espiritual e comprove com uma foto.', 'minguante', 100, extract(month from now())::int);

-- ---------- Permite o novo tipo de post ao compartilhar uma comprovação ----------
alter table public.posts drop constraint posts_type_check;
alter table public.posts add constraint posts_type_check
  check (type = any (array['text','altar_photo','oracle_reading','quest_proof']));
