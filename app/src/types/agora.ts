export interface CommentViewModel {
  authorName: string;
  content: string;
}

export interface PostViewModel {
  id: string;
  userId: string;
  user: string;
  verified: boolean;
  trad: string;
  type: string;
  time: string;
  content: string;
  cards: string[];
  media: string[];
  blessings: number;
  reposts: number;
  saved: boolean;
  reposted: boolean;
  liked: boolean;
  comments: CommentViewModel[];
  commentsLoaded: boolean;
  showComments: boolean;
}

export interface StoryItem {
  id: string;
  mediaUrl: string | null;
  textContent: string | null;
  bgColor: string | null;
  createdAt: string;
}

export interface StoryGroup {
  userId: string;
  name: string;
  trad: string;
  verified: boolean;
  items: StoryItem[];
}

export type FeedTab = 'para-voce' | 'seguindo' | 'minha-senda';
