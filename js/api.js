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

/* ---------------- NOTIFICATIONS ---------------- */
export async function fetchNotifications(userId, limit = 30) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, profiles!actor_id(display_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchUnreadNotificationCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
}

export async function markNotificationsRead(userId) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw error;
}

export async function createNotification(userId, actorId, type, targetId) {
  if (userId === actorId) return;
  const { error } = await supabase.from('notifications').insert({ user_id: userId, actor_id: actorId, type, target_id: targetId });
  if (error) throw error;
}

export function subscribeToNotifications(userId, onInsert) {
  const channel = supabase.channel('notifications:' + userId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, (payload) => onInsert(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* ---------------- DIRECT MESSAGES ---------------- */
export async function fetchConversations(userId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, user1:profiles!user1_id(id,display_name), user2:profiles!user2_id(id,display_name)')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrCreateConversation(myId, otherId) {
  const [user1_id, user2_id] = myId < otherId ? [myId, otherId] : [otherId, myId];
  const { data: existing, error: selErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('user1_id', user1_id)
    .eq('user2_id', user2_id)
    .maybeSingle();
  if (selErr) throw selErr;
  if (existing) return existing;
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user1_id, user2_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId) {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendMessage(conversationId, senderId, content) {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;
  await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', conversationId);
  return data;
}

export async function markMessagesRead(conversationId, myId) {
  const { error } = await supabase.from('direct_messages').update({ is_read: true }).eq('conversation_id', conversationId).neq('sender_id', myId);
  if (error) throw error;
}

export async function fetchUnreadMessageCount(userId) {
  const convos = await fetchConversations(userId);
  if (!convos.length) return 0;
  const ids = convos.map(c => c.id);
  const { count, error } = await supabase
    .from('direct_messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', ids)
    .eq('is_read', false)
    .neq('sender_id', userId);
  if (error) throw error;
  return count || 0;
}

export function subscribeToMessages(conversationId, onInsert) {
  const channel = supabase.channel('dm:' + conversationId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => onInsert(payload.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function searchProfiles(query, excludeId, limit = 8) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username')
    .ilike('display_name', `%${query}%`)
    .neq('id', excludeId)
    .limit(limit);
  if (error) throw error;
  return data;
}
