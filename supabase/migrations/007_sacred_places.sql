-- =========================================================
-- ARCANUM V2.0 — Radar Sagrado (Módulo 5): mapa GPS leve com
-- Leaflet.js + OpenStreetMap, sem custo de API.
-- =========================================================

create table public.sacred_places (
  id uuid default uuid_generate_v4() primary key,
  name text not null check (char_length(name) between 1 and 100),
  category text not null check (category in ('loja','ervanaria','terreiro','templo','livraria')),
  address text not null,
  city text not null,
  latitude double precision not null,
  longitude double precision not null,
  phone text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);
alter table public.sacred_places enable row level security;
create policy "Radar Sagrado é público" on public.sacred_places for select using (true);
create policy "Usuários autenticados podem adicionar locais" on public.sacred_places
  for insert with check (auth.uid() = created_by);

-- ---------- Seed de exemplo (São Paulo) ----------
insert into public.sacred_places (name, category, address, city, latitude, longitude, phone) values
  ('Ervanária Caminhos da Terra', 'ervanaria', 'Rua Augusta, 1200', 'São Paulo', -23.5558, -46.6396, null),
  ('Terreiro Filhos de Oxóssi', 'terreiro', 'Rua da Mata, 45', 'São Paulo', -23.5489, -46.6388, null),
  ('Livraria Arcana', 'livraria', 'Av. Paulista, 900', 'São Paulo', -23.5629, -46.6544, null),
  ('Loja Sete Chaves', 'loja', 'Rua Vergueiro, 300', 'São Paulo', -23.5605, -46.6333, null);
