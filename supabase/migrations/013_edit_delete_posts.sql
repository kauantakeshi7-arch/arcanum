-- =========================================================
-- ARCANUM — Editar/apagar publicações
-- posts já tinha policy de delete (nunca usada na UI) mas faltava
-- update. coven_posts não tinha nem delete nem update.
-- =========================================================

create policy "Users can update their own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy "Autores apagam suas próprias publicações no coven" on public.coven_posts
  for delete using (auth.uid() = user_id);

create policy "Autores editam suas próprias publicações no coven" on public.coven_posts
  for update using (auth.uid() = user_id);
