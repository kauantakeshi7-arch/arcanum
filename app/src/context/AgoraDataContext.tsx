import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { relativeTime } from '../lib/constants';
import { useSession } from './SessionContext';
import type { FeedTab, PostViewModel, StoryGroup } from '../types/agora';

interface AgoraDataContextValue {
  loading: boolean;
  posts: PostViewModel[];
  storiesByUser: StoryGroup[];
  storyViewIds: Set<string>;
  followingIds: Set<string>;
  feedTab: FeedTab;
  onboardingDismissed: boolean;
  setFeedTab: (tab: FeedTab) => void;
  toggleLike: (postId: string) => Promise<void>;
  toggleRepost: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleComments: (postId: string) => Promise<void>;
  sendComment: (postId: string, content: string) => Promise<void>;
  dismissOnboarding: () => void;
  markStorySeen: (storyId: string) => void;
  addLocalStory: (group: StoryGroup) => void;
  addLocalPost: (post: PostViewModel) => void;
}

const AgoraDataContext = createContext<AgoraDataContextValue | null>(null);

const ONBOARDING_KEY = 'arcanum_onboarding_dismissed';

export function AgoraDataProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useSession();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostViewModel[]>([]);
  const [storiesByUser, setStoriesByUser] = useState<StoryGroup[]>([]);
  const [storyViewIds, setStoryViewIds] = useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [feedTab, setFeedTab] = useState<FeedTab>('para-voce');
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => !!localStorage.getItem(ONBOARDING_KEY),
  );

  useEffect(() => {
    if (!userId) return;
    let active = true;

    async function load() {
      setLoading(true);
      const [postRows, myLikes, following, blocked, storyRows, myStoryViews] = await Promise.all([
        api.fetchPosts(),
        api.fetchMyLikedPostIds(userId!),
        api.fetchFollowingIds(userId!),
        api.fetchBlockedIds(userId!),
        api.fetchActiveStories(),
        api.fetchMyStoryViewIds(userId!),
      ]);
      if (!active) return;

      setPosts(
        postRows
          .filter((row) => !blocked.has(row.user_id))
          .map((row) => ({
            id: row.id,
            userId: row.user_id,
            user: row.profiles?.display_name || 'Alguém',
            verified: !!row.profiles?.is_verified,
            trad: row.religion_path,
            type: row.type,
            time: relativeTime(row.created_at),
            content: row.content,
            cards: row.oracle_cards || [],
            media: row.media_urls || [],
            blessings: row.blessings_count,
            reposts: 0,
            saved: false,
            reposted: false,
            liked: myLikes.has(row.id),
            comments: [],
            commentsLoaded: false,
            showComments: false,
          })),
      );

      setFollowingIds(following);

      const storyGroups = new Map<string, StoryGroup>();
      (storyRows as unknown as Array<{
        id: string;
        user_id: string;
        media_url: string | null;
        text_content: string | null;
        bg_color: string | null;
        created_at: string;
        profiles?: { display_name: string; religion_path: string; is_verified: boolean };
      }>)
        .filter((row) => !blocked.has(row.user_id))
        .forEach((row) => {
          if (!storyGroups.has(row.user_id)) {
            storyGroups.set(row.user_id, {
              userId: row.user_id,
              name: row.profiles?.display_name || 'Alguém',
              trad: row.profiles?.religion_path || 'solitario',
              verified: !!row.profiles?.is_verified,
              items: [],
            });
          }
          storyGroups.get(row.user_id)!.items.push({
            id: row.id,
            mediaUrl: row.media_url,
            textContent: row.text_content,
            bgColor: row.bg_color,
            createdAt: row.created_at,
          });
        });
      setStoriesByUser(Array.from(storyGroups.values()));
      setStoryViewIds(myStoryViews);
      setLoading(false);
    }

    load().catch((err) => {
      console.error('Falha ao carregar dados da Ágora:', err);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const toggleLike = useCallback(
    async (postId: string) => {
      if (!userId) return;
      let wasLiked = false;
      let targetUserId: string | null = null;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          wasLiked = p.liked;
          targetUserId = p.userId;
          return { ...p, liked: !p.liked, blessings: p.blessings + (p.liked ? -1 : 1) };
        }),
      );
      try {
        if (!wasLiked) {
          await api.likePost(postId, userId);
          if (targetUserId) api.createNotification(targetUserId, userId, 'like', postId).catch(console.error);
        } else {
          await api.unlikePost(postId, userId);
        }
      } catch (err) {
        console.error(err);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, liked: wasLiked, blessings: p.blessings + (wasLiked ? 1 : -1) } : p,
          ),
        );
      }
    },
    [userId],
  );

  // Reposts e "salvar" não têm tabela no banco ainda (ver README) — assim como
  // no app original, ficam só na memória e se perdem ao recarregar.
  const toggleRepost = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, reposted: !p.reposted, reposts: p.reposts + (p.reposted ? -1 : 1) } : p,
      ),
    );
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, saved: !p.saved } : p)));
  }, []);

  const toggleComments = useCallback(async (postId: string) => {
    let needsLoad = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        needsLoad = !p.showComments && !p.commentsLoaded;
        return { ...p, showComments: !p.showComments };
      }),
    );
    if (!needsLoad) return;
    try {
      const rows = await api.fetchComments(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                commentsLoaded: true,
                comments: (rows as unknown as Array<{ content: string; profiles?: { display_name: string } }>).map(
                  (r) => ({ authorName: r.profiles?.display_name || 'Alguém', content: r.content }),
                ),
              }
            : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const sendComment = useCallback(
    async (postId: string, content: string) => {
      if (!userId || !profile) return;
      const row = await api.addComment(postId, userId, content);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, showComments: true, comments: [...p.comments, { authorName: profile.display_name, content }] }
            : p,
        ),
      );
      const targetUserId = posts.find((p) => p.id === postId)?.userId;
      if (targetUserId) api.createNotification(targetUserId, userId, 'comment', postId).catch(console.error);
      void row;
    },
    [userId, profile, posts],
  );

  const dismissOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setOnboardingDismissed(true);
  }, []);

  const markStorySeen = useCallback((storyId: string) => {
    setStoryViewIds((prev) => new Set(prev).add(storyId));
    if (userId) api.markStoryViewed(storyId, userId).catch(console.error);
  }, [userId]);

  const addLocalPost = useCallback((post: PostViewModel) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const addLocalStory = useCallback((group: StoryGroup) => {
    setStoriesByUser((prev) => {
      const existing = prev.find((g) => g.userId === group.userId);
      if (!existing) return [group, ...prev];
      return prev.map((g) => (g.userId === group.userId ? { ...g, items: [...g.items, ...group.items] } : g));
    });
  }, []);

  return (
    <AgoraDataContext.Provider
      value={{
        loading,
        posts,
        storiesByUser,
        storyViewIds,
        followingIds,
        feedTab,
        onboardingDismissed,
        setFeedTab,
        toggleLike,
        toggleRepost,
        toggleSave,
        toggleComments,
        sendComment,
        dismissOnboarding,
        markStorySeen,
        addLocalStory,
        addLocalPost,
      }}
    >
      {children}
    </AgoraDataContext.Provider>
  );
}

export function useAgoraData() {
  const ctx = useContext(AgoraDataContext);
  if (!ctx) throw new Error('useAgoraData precisa estar dentro de <AgoraDataProvider>');
  return ctx;
}
