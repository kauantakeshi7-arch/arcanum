-- =========================================================
-- ARCANUM — Notificações completas
-- Expande os tipos permitidos para cobrir seguir, covens e stories,
-- recursos que foram lançados sem nenhuma notificação associada.
-- =========================================================

alter table public.notifications drop constraint if exists notifications_type_check;

alter table public.notifications add constraint notifications_type_check
  check (type in (
    'like','comment','candle_light','message','connection',
    'follow','coven_join','coven_promote','coven_remove',
    'coven_post_like','coven_post_comment','story_view'
  ));
