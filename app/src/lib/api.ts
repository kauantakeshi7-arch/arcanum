// Porte tipado de ../../../js/api.js — mesmas funções, mesmos nomes, mesma
// lógica. Nenhum comportamento muda aqui, só tipos são adicionados. Ver o
// arquivo original para comentários sobre casos específicos (ex: por que
// firmCandleLight não pode duplicar contagem mesmo se chamado duas vezes).
import { supabase } from './supabaseClient';
import type { Post, PostWithCounts, CovenWithCounts, NotificationRow } from '../types/db';

/* ---------------- FEED ---------------- */
export async function fetchPosts(limit = 50): Promise<PostWithCounts[]> {
  const { data, error } = await supabase
    .from('posts_with_counts')
    .select('*, profiles!user_id(display_name, religion_path, is_verified)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as PostWithCounts[];
}

export async function fetchUserPosts(userId: string, limit = 30): Promise<PostWithCounts[]> {
  const { data, error } = await supabase
    .from('posts_with_counts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as PostWithCounts[];
}

export interface CreatePostParams {
  userId: string;
  religionPath: string;
  type: string;
  content: string;
  oracleCards?: string[] | null;
  mediaUrls?: string[] | null;
}

export async function createPost({
  userId,
  religionPath,
  type,
  content,
  oracleCards,
  mediaUrls,
}: CreatePostParams): Promise<Post> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      religion_path: religionPath,
      type,
      content,
      oracle_cards: oracleCards || null,
      media_urls: mediaUrls || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(postId: string, content: string): Promise<void> {
  const { error } = await supabase.from('posts').update({ content }).eq('id', postId);
  if (error) throw error;
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

/* ---------------- MEDIA UPLOAD (bucket posts-media) ---------------- */
export async function uploadPostMedia(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage
    .from('posts-media')
    .upload(path, blob, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('posts-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function hasLiked(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function fetchMyLikedPostIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('post_likes').select('post_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.post_id));
}

export async function fetchMyLitCandleIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('candle_lights').select('candle_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.candle_id));
}

export async function likePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchComments(postId: string) {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*, profiles(display_name)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function addComment(postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- GRIMÓRIO (privado) ---------------- */
export async function fetchGrimoire(userId: string) {
  const { data, error } = await supabase
    .from('grimoire_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export interface GrimoireEntryInput {
  entry_type: string;
  title: string;
  content: string;
}

export async function addGrimoireEntry(userId: string, entry: GrimoireEntryInput) {
  const { data, error } = await supabase
    .from('grimoire_entries')
    .insert({ user_id: userId, ...entry })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- VELAS DE ORAÇÃO ---------------- */
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

export async function lightNewCandle(userId: string, intention: string) {
  const { data, error } = await supabase
    .from('prayer_candles')
    .insert({ user_id: userId, intention })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function firmCandleLight(candleId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('candle_lights').insert({ candle_id: candleId, user_id: userId });
  if (error) throw error;
}

export async function hasLitCandle(candleId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('candle_lights')
    .select('candle_id')
    .eq('candle_id', candleId)
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

/* ---------------- NOTIFICAÇÕES ---------------- */
export async function fetchNotifications(userId: string, limit = 30): Promise<NotificationRow[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, profiles!actor_id(display_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as NotificationRow[];
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count || 0;
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function createNotification(
  userId: string,
  actorId: string,
  type: string,
  targetId: string | null,
): Promise<void> {
  if (userId === actorId) return;
  const { error } = await supabase
    .from('notifications')
    .insert({ user_id: userId, actor_id: actorId, type, target_id: targetId });
  if (error) throw error;
}

export function subscribeToNotifications(userId: string, onInsert: (row: NotificationRow) => void) {
  const channel = supabase
    .channel('notifications:' + userId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new as NotificationRow),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* ---------------- MENSAGENS DIRETAS ---------------- */
export async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, user1:profiles!user1_id(id,display_name), user2:profiles!user2_id(id,display_name)')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrCreateConversation(myId: string, otherId: string) {
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

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const { data, error } = await supabase
    .from('direct_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
  if (error) throw error;
  await supabase
    .from('conversations')
    .update({ last_message: content, last_message_at: new Date().toISOString() })
    .eq('id', conversationId);
  return data;
}

export async function markMessagesRead(conversationId: string, myId: string): Promise<void> {
  const { error } = await supabase
    .from('direct_messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', myId);
  if (error) throw error;
}

export async function fetchUnreadMessageCount(userId: string): Promise<number> {
  const convos = await fetchConversations(userId);
  if (!convos.length) return 0;
  const ids = convos.map((c) => c.id);
  const { count, error } = await supabase
    .from('direct_messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', ids)
    .eq('is_read', false)
    .neq('sender_id', userId);
  if (error) throw error;
  return count || 0;
}

export function subscribeToMessages(conversationId: string, onInsert: (row: unknown) => void) {
  const channel = supabase
    .channel('dm:' + conversationId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onInsert(payload.new),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}

/* ---------------- COVENS / TERREIROS ---------------- */
export async function fetchCovens(limit = 40): Promise<CovenWithCounts[]> {
  const { data, error } = await supabase
    .from('covens_with_counts')
    .select('*')
    .order('member_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as unknown as CovenWithCounts[];
}

export async function fetchMyCovenIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('coven_members').select('coven_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.coven_id));
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 6)
  );
}

export interface CreateCovenParams {
  name: string;
  tradition: string;
  description?: string | null;
  privacy?: 'public' | 'approval' | 'secret';
  createdBy: string;
}

export async function createCoven({ name, tradition, description, privacy, createdBy }: CreateCovenParams) {
  const { data, error } = await supabase
    .from('covens')
    .insert({
      name,
      tradition,
      description,
      privacy: privacy || 'public',
      created_by: createdBy,
      slug: slugify(name),
    })
    .select()
    .single();
  if (error) throw error;
  await supabase.from('coven_members').insert({ coven_id: data.id, user_id: createdBy, role: 'founder' });
  return data;
}

export async function joinCoven(covenId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('coven_members').insert({ coven_id: covenId, user_id: userId });
  if (error) throw error;
}

export async function leaveCoven(covenId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('coven_members')
    .delete()
    .eq('coven_id', covenId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchCovenPosts(covenId: string) {
  const { data, error } = await supabase
    .from('coven_posts_with_author')
    .select('*')
    .eq('coven_id', covenId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function postToCoven(covenId: string, userId: string, content: string, mediaUrl?: string | null) {
  const { data, error } = await supabase
    .from('coven_posts')
    .insert({ coven_id: covenId, user_id: userId, content, media_url: mediaUrl || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCovenPost(postId: string, content: string): Promise<void> {
  const { error } = await supabase.from('coven_posts').update({ content }).eq('id', postId);
  if (error) throw error;
}

export async function deleteCovenPost(postId: string): Promise<void> {
  const { error } = await supabase.from('coven_posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function uploadCovenPostMedia(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/coven-posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage
    .from('posts-media')
    .upload(path, blob, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('posts-media').getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchMyCovenPostLikeIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('coven_post_likes').select('post_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.post_id));
}

export async function likeCovenPost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase.from('coven_post_likes').insert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

export async function unlikeCovenPost(postId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('coven_post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchCovenPostComments(postId: string) {
  const { data, error } = await supabase
    .from('coven_post_comments_with_author')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function postCovenComment(postId: string, userId: string, content: string) {
  const { data, error } = await supabase
    .from('coven_post_comments')
    .insert({ post_id: postId, user_id: userId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- MEMBROS E MODERAÇÃO DO COVEN ---------------- */
export async function fetchCovenMembers(covenId: string) {
  const { data, error } = await supabase
    .from('coven_members_with_profile')
    .select('*')
    .eq('coven_id', covenId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function updateCovenMemberRole(covenId: string, userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('coven_members')
    .update({ role })
    .eq('coven_id', covenId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function removeCovenMember(covenId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('coven_members')
    .delete()
    .eq('coven_id', covenId)
    .eq('user_id', userId);
  if (error) throw error;
}

/* ---------------- IDENTIDADE DO COVEN ---------------- */
export async function updateCoven(covenId: string, patch: Record<string, unknown>) {
  const { data, error } = await supabase.from('covens').update(patch).eq('id', covenId).select().single();
  if (error) throw error;
  return data;
}

/* ---------------- MURAL DE GRAÇAS ALCANÇADAS ---------------- */
export async function fetchGratitude(limit = 40) {
  const { data, error } = await supabase
    .from('gratitude_with_counts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchMyFlowerIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('gratitude_flowers')
    .select('testimonial_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.testimonial_id));
}

export async function postGratitude(userId: string, guideName: string, testimony: string) {
  const { data, error } = await supabase
    .from('gratitude_testimonials')
    .insert({ user_id: userId, guide_name: guideName, testimony })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sendFlower(testimonialId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('gratitude_flowers')
    .insert({ testimonial_id: testimonialId, user_id: userId });
  if (error) throw error;
}

/* ---------------- PASSE LUNAR (missões com comprovação por foto) ---------------- */
export async function fetchLunarQuests() {
  const seasonMonth = new Date().getMonth() + 1;
  const { data, error } = await supabase
    .from('lunar_quests')
    .select('*')
    .eq('season_month', seasonMonth)
    .order('required_moon_phase');
  if (error) throw error;
  return data;
}

export async function fetchMyQuestCompletions(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('quest_completions').select('quest_id').eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.quest_id));
}

export async function completeLunarQuest(
  questId: string,
  userId: string,
  proofPhotoUrl: string | null,
  sharedToFeed: boolean,
) {
  const { data, error } = await supabase
    .from('quest_completions')
    .insert({ quest_id: questId, user_id: userId, proof_photo_url: proofPhotoUrl, shared_to_feed: sharedToFeed })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- RADAR SAGRADO (mapa de locais) ---------------- */
export async function fetchSacredPlaces() {
  const { data, error } = await supabase.from('sacred_places').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export interface CreateSacredPlaceParams {
  name: string;
  category: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  createdBy: string;
}

export async function createSacredPlace({
  name,
  category,
  address,
  city,
  latitude,
  longitude,
  phone,
  createdBy,
}: CreateSacredPlaceParams) {
  const { data, error } = await supabase
    .from('sacred_places')
    .insert({ name, category, address, city, latitude, longitude, phone: phone || null, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function searchProfiles(query: string, excludeId: string, limit = 8) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, is_verified')
    .ilike('display_name', `%${query}%`)
    .neq('id', excludeId)
    .limit(limit);
  if (error) throw error;
  return data;
}

/* ---------------- PERFIL PÚBLICO ---------------- */
export async function fetchPublicProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, religion_path, mana_xp, streak_days, is_verified, created_at')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/* ---------------- SEGUIR ---------------- */
export async function followUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
}

export async function fetchFollowingIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('follows').select('following_id').eq('follower_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.following_id));
}

export async function fetchFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([
    supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  if (followers.error) throw followers.error;
  if (following.error) throw following.error;
  return { followers: followers.count || 0, following: following.count || 0 };
}

/* ---------------- BLOQUEAR ---------------- */
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
  if (error) throw error;
  // Deixar de seguir/ser seguido silenciosamente ao bloquear.
  await supabase.from('follows').delete().eq('follower_id', blockerId).eq('following_id', blockedId);
  await supabase.from('follows').delete().eq('follower_id', blockedId).eq('following_id', blockerId);
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const { error } = await supabase.from('blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
  if (error) throw error;
}

export async function fetchBlockedIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('blocks').select('blocked_id').eq('blocker_id', userId);
  if (error) throw error;
  return new Set(data.map((r) => r.blocked_id));
}

/* ---------------- DENUNCIAR ---------------- */
export interface ReportContentParams {
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
}

export async function reportContent({ reporterId, targetType, targetId, reason }: ReportContentParams): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .insert({ reporter_id: reporterId, target_type: targetType, target_id: targetId, reason });
  if (error) throw error;
}

/* ---------------- BADGES (contagens para conquistas) ---------------- */
export async function fetchUserCovenFoundedCount(userId: string): Promise<number> {
  const { count, error } = await supabase.from('covens').select('id', { count: 'exact', head: true }).eq('created_by', userId);
  if (error) throw error;
  return count || 0;
}

export async function fetchUserGratitudeCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('gratitude_testimonials')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}

export async function fetchUserLunarCompletionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('quest_completions')
    .select('quest_id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}

export async function fetchUserCandleLightsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('candle_lights')
    .select('candle_id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}

/* ---------------- GUARDIÃO DO VÉU (IA) ---------------- */
// Chama a Edge Function guardian-ai (Gemini roda no servidor, a chave nunca
// chega ao navegador). Se falhar por qualquer motivo, retorna null para o
// chamador usar a resposta local pré-escrita como respaldo.
export async function askGuardianAI(category: string, question: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('guardian-ai', {
      body: { category, question },
    });
    if (error || !data || data.fallback || !data.answer) return null;
    return data.answer;
  } catch (err) {
    console.error('askGuardianAI falhou, usando resposta local:', err);
    return null;
  }
}

/* ---------------- STORIES ---------------- */
export async function fetchActiveStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*, profiles!user_id(display_name, religion_path, is_verified)')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchMyStoryViewIds(viewerId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('story_views').select('story_id').eq('viewer_id', viewerId);
  if (error) throw error;
  return new Set(data.map((r) => r.story_id));
}

export interface CreateStoryParams {
  userId: string;
  mediaUrl?: string | null;
  textContent?: string | null;
  bgColor?: string | null;
}

export async function createStory({ userId, mediaUrl, textContent, bgColor }: CreateStoryParams) {
  const { data, error } = await supabase
    .from('stories')
    .insert({ user_id: userId, media_url: mediaUrl || null, text_content: textContent || null, bg_color: bgColor || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markStoryViewed(storyId: string, viewerId: string): Promise<void> {
  const { error } = await supabase
    .from('story_views')
    .upsert({ story_id: storyId, viewer_id: viewerId }, { onConflict: 'story_id,viewer_id' });
  if (error) throw error;
}

export async function fetchStoryViewCount(storyId: string): Promise<number> {
  const { count, error } = await supabase
    .from('story_views')
    .select('viewer_id', { count: 'exact', head: true })
    .eq('story_id', storyId);
  if (error) throw error;
  return count || 0;
}

export async function uploadStoryMedia(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/stories/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage
    .from('posts-media')
    .upload(path, blob, { contentType: 'image/webp', upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('posts-media').getPublicUrl(path);
  return data.publicUrl;
}
