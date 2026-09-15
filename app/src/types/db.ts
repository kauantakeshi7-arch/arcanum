// Tipos hand-written que espelham as colunas usadas por lib/auth.ts e
// lib/api.ts hoje. Ampliar conforme cada tela for portada (Fase 2+) — não é
// necessário cobrir 100% do schema já na Fase 1. Fonte de verdade real:
// ../../../supabase/schema.sql e ../../../supabase/migrations/*.sql

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  religion_path: string;
  mana_xp: number;
  streak_days: number;
  is_verified: boolean;
  referred_by: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  religion_path: string;
  type: string;
  content: string;
  oracle_cards: string[] | null;
  media_urls: string[] | null;
  created_at: string;
}

export interface PostWithCounts extends Post {
  blessings_count: number;
  comments_count: number;
  profiles: Pick<Profile, 'display_name' | 'religion_path' | 'is_verified'>;
}

export interface Coven {
  id: string;
  name: string;
  slug: string;
  tradition: string;
  description: string | null;
  privacy: 'public' | 'private';
  created_by: string;
  pinned_announcement: string | null;
  created_at: string;
}

export interface CovenWithCounts extends Coven {
  member_count: number;
  post_count: number;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string;
  type: string;
  target_id: string | null;
  is_read: boolean;
  created_at: string;
  profiles: Pick<Profile, 'display_name'>;
}
