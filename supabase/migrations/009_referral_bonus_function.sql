-- =========================================================
-- ARCANUM — Função segura para aplicar o bônus de convite.
--
-- O update direto do mana_xp do REFERENCIADOR pelo cliente falha
-- silenciosamente: a policy de UPDATE em profiles só permite
-- auth.uid() = id, então o novo usuário nunca consegue creditar Mana
-- na conta de quem o convidou. Esta função roda com privilégio do
-- dono (security definer) para contornar isso de forma controlada,
-- sem abrir uma brecha geral de escrita entre perfis.
-- =========================================================

create or replace function public.apply_referral_bonus(p_referrer_id uuid, p_new_user_id uuid, p_bonus int default 50)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set mana_xp = mana_xp + p_bonus where id = p_referrer_id;
  update public.profiles set mana_xp = mana_xp + p_bonus where id = p_new_user_id;
end;
$$;

grant execute on function public.apply_referral_bonus(uuid, uuid, int) to authenticated;
