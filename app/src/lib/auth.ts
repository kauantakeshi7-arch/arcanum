// Porte tipado de ../../../js/auth.js — mesmas assinaturas e comportamento,
// nenhuma mudança de lógica. Ver o arquivo original para o comentário sobre
// por que ensureProfile é chamado a cada login (idempotente) e por que o
// bônus de indicação é best-effort (nunca deve bloquear o cadastro).
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { Profile } from '../types/db';

export interface SignUpParams {
  email: string;
  password: string;
  username: string;
  display_name: string;
  referredBy?: string | null;
}

export interface SignInParams {
  email: string;
  password: string;
}

interface EnsureProfileDefaults {
  username: string;
  display_name: string;
  referredBy?: string | null;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp({ email, password, username, display_name, referredBy }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Guardado no próprio auth user, então sobrevive mesmo se a confirmação
    // de e-mail atrasar a criação do profile até o primeiro login abaixo.
    options: { data: { username, display_name, referred_by: referredBy || null } },
  });
  if (error) throw error;

  if (data.session && data.user) {
    await ensureProfile(data.user.id, { username, display_name, referredBy });
  }
  return data;
}

export async function signIn({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const meta = data.user.user_metadata || {};
  await ensureProfile(data.user.id, {
    username: meta.username || email.split('@')[0] + '.' + data.user.id.slice(0, 4),
    display_name: meta.display_name || email.split('@')[0],
    referredBy: meta.referred_by || null,
  });
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Cria a linha em profiles na primeira vez que o usuário é visto. Seguro de
// chamar em todo login — é no-op se a linha já existir.
export async function ensureProfile(userId: string, defaults: EnsureProfileDefaults) {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (existing) return;
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    username: defaults.username,
    display_name: defaults.display_name,
    religion_path: 'solitario',
    referred_by: defaults.referredBy || null,
  });
  if (error) throw error;
  if (defaults.referredBy) {
    // Bônus de boas-vindas best-effort para os dois lados de uma indicação
    // completa — uma falha aqui nunca deve bloquear o cadastro em si. Roda
    // via função security-definer porque a RLS do cliente só permite
    // atualizar o próprio profile, não o de quem indicou.
    try {
      await supabase.rpc('apply_referral_bonus', {
        p_referrer_id: defaults.referredBy,
        p_new_user_id: userId,
        p_bonus: 50,
      });
    } catch (e) {
      console.error('Falha ao aplicar bônus de convite:', e);
    }
  }
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, patch: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
