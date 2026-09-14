-- =========================================================
-- ARCANUM V2.0 — Loja de Mana (Módulo 4): itens cosméticos
-- comprados com o Mana (XP) acumulado.
-- =========================================================

alter table public.profiles
  add column if not exists unlocked_items text[] default array['aura:default','robe:default','item:default'];
