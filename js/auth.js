import { supabase } from './supabaseClient.js';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp({ email, password, username, display_name, referredBy }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Stored on the auth user itself, so it survives even if email
    // confirmation delays profile creation until the first sign-in below.
    options: { data: { username, display_name, referred_by: referredBy || null } }
  });
  if (error) throw error;

  if (data.session) {
    await ensureProfile(data.user.id, { username, display_name, referredBy });
  }
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const meta = data.user.user_metadata || {};
  await ensureProfile(data.user.id, {
    username: meta.username || (email.split('@')[0] + '.' + data.user.id.slice(0, 4)),
    display_name: meta.display_name || email.split('@')[0],
    referredBy: meta.referred_by || null
  });
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Creates a profiles row the first time a user is seen. Safe to call on
// every login — it's a no-op if the row already exists.
export async function ensureProfile(userId, defaults) {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle();
  if (existing) return;
  const { error } = await supabase.from('profiles').insert({
    id: userId,
    username: defaults.username,
    display_name: defaults.display_name,
    religion_path: 'solitario',
    referred_by: defaults.referredBy || null
  });
  if (error) throw error;
  if (defaults.referredBy) {
    // Best-effort welcome bonus for both sides of a completed referral —
    // a failure here should never block the sign-up itself. Runs through
    // a security-definer function because the client's own RLS policy
    // only allows updating your own profile, not the referrer's.
    try {
      await supabase.rpc('apply_referral_bonus', { p_referrer_id: defaults.referredBy, p_new_user_id: userId, p_bonus: 50 });
    } catch (e) {
      console.error('Falha ao aplicar bônus de convite:', e);
    }
  }
}

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, patch) {
  const { data, error } = await supabase.from('profiles').update(patch).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}
