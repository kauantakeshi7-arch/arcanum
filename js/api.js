import { supabase } from './supabaseClient.js';

/* ---------------- FEED ---------------- */
export async function fetchPosts(limit = 50) {
  const { data, error } = await supabase
    .from('posts_with_counts')
    .select('*, profiles!user_id(display_name, religion_path)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function createPost({ userId, religionPath, type, content, oracleCards }) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ user_id: userId, religion_path: religionPath, type, content, oracle_cards: oracleCards || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function hasLiked(postId, userId) {
  const { data } = await supabase.from('post_likes').select('post_id').eq('post_id', postId).eq('user_id', userId).maybeSingle();
  return !!data;
}

export async function fetchMyLikedPostIds(userId) {
  const { data, error } = await supabase.from('post_likes').select('post_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map(r => r.post_id));
}

export async function fetchMyLitCandleIds(userId) {
  const { data, error } = await supabase.from('candle_lights').select('candle_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map(r => r.candle_id));
}

export async function likePost(postId, userId) {
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function unlikePost(postId, userId) {
  const { error } = await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  if (error) throw error;
}

export async function fetchComments(postId) {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, profiles(display_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addComment(postId, userId, content) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- GRIMOIRE (private) ---------------- */
export async function fetchGrimoire(userId) {
  const { data, error } = await supabase
    .from('grimoire_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addGrimoireEntry(userId, { entry_type, title, content }) {
  const { data, error } = await supabase
    .from('grimoire_entries')
    .insert({ user_id: userId, entry_type, title, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- PRAYER CANDLES ---------------- */
export async function fetchCandles(limit = 30) {
  const { data, error } = await supabase
    .from('candles_with_counts')
    .select('*, profiles!user_id(display_name)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function lightNewCandle(userId, intention) {
  const { data, error } = await supabase
    .from('prayer_candles')
    .insert({ user_id: userId, intention })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function firmCandleLight(candleId, userId) {
  // Primary key (candle_id, user_id) means a duplicate insert fails safely —
  // callers should check hasLitCandle first for a good UX, but this can't
  // double-count even if called twice.
  const { error } = await supabase.from('candle_lights').insert({ candle_id: candleId, user_id: userId });
  if (error) throw error;
}

export async function hasLitCandle(candleId, userId) {
  const { data } = await supabase.from('candle_lights').select('candle_id').eq('candle_id', candleId).eq('user_id', userId).maybeSingle();
  return !!data;
}
