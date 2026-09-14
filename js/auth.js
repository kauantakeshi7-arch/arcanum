import { supabase } from './supabaseClient.js';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUp({ email, password, username, display_name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Stored on the auth user itself, so it survives even if email
    // confirmation delays profile creation until the first sign-in below.
    options: { data: { username, display_name } }
  });
  if (error) throw error;

  if (data.session) {
    await ensureProfile(data.user.id, { username, display_name });
  }
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const meta = data.user.user_metadata || {};
  await ensureProfile(data.user.id, {
    username: meta.username || (email.split('@')[0] + '.' + data.user.id.slice(0, 4)),
    display_name: meta.display_name || email.split('@')[0]
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
    religion_path: 'solitario'
  });
  if (error) throw error;
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
