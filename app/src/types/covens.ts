export interface CovenListItem {
  id: string;
  name: string;
  slug: string;
  tradition: string;
  description: string | null;
  privacy: 'public' | 'approval' | 'secret';
  memberCount: number;
  createdBy: string;
  pinnedAnnouncement: string | null;
  joined: boolean;
}

export interface CovenPostCommentViewModel {
  authorName: string;
  content: string;
}

export interface CovenPostViewModel {
  id: string;
  userId: string;
  authorName: string;
  content: string;
  mediaUrl: string | null;
  createdAt: string;
  likesCount: number;
  liked: boolean;
  commentsCount: number;
  comments: CovenPostCommentViewModel[];
  commentsLoaded: boolean;
  showComments: boolean;
}

export interface CovenMemberViewModel {
  userId: string;
  displayName: string;
  isVerified: boolean;
  role: 'member' | 'moderator' | 'founder';
}

export type CovenFilter = 'all' | string;
