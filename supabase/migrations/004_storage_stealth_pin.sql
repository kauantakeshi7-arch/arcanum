-- =========================================================
-- ARCANUM V2.0 — Storage bucket para fotos + PIN do Modo Discreto
-- =========================================================

-- ---------- STORAGE: posts-media ----------
-- Usado para fotos de altar, comprovação de rituais (Passe Lunar), etc.
-- Convenção de path: {user_id}/{arquivo}, o que permite a política de
-- RLS abaixo restringir escrita/edição/exclusão ao próprio dono.
insert into storage.buckets (id, name, public)
values ('posts-media', 'posts-media', true)
on conflict (id) do nothing;

update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
where id = 'posts-media';

create policy "Public read access on posts-media" on storage.objects
  for select using (bucket_id = 'posts-media');

create policy "Users can upload to their own folder in posts-media" on storage.objects
  for insert with check (
    bucket_id = 'posts-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own files in posts-media" on storage.objects
  for update using (
    bucket_id = 'posts-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own files in posts-media" on storage.objects
  for delete using (
    bucket_id = 'posts-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------- Modo Discreto / Cofre Oculto ----------
-- Código pessoal que reabre o Arcanum a partir da calculadora-disfarce.
alter table public.profiles add column if not exists stealth_pin text default '7777';
