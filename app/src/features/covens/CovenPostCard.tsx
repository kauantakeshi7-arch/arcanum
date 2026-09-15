import { useState } from 'react';
import { initials, relativeTime, tradColor } from '../../lib/constants';
import type { CovenPostViewModel } from '../../types/covens';
import styles from './CovenPostCard.module.css';

// Porte de index.html:4519-4556 (covenPostCardHtml).
export function CovenPostCard({ post, tradition, isMine, onToggleLike, onToggleComments, onSendComment, onOpenMenu }: {
  post: CovenPostViewModel;
  tradition: string;
  isMine: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onSendComment: (content: string) => void;
  onOpenMenu: () => void;
}) {
  const [draft, setDraft] = useState('');
  const c = tradColor(tradition);

  function handleSend() {
    const value = draft.trim();
    if (!value) return;
    setDraft('');
    onSendComment(value);
  }

  return (
    <div className={styles.card}>
      <div className={styles.postHead}>
        <div className={styles.postHeadLink}>
          <div className="avatar-sm" style={{ background: `linear-gradient(145deg, ${c}, ${c}cc)` }}>
            {initials(post.authorName)}
          </div>
          <div className={styles.postMeta}>
            <div className={styles.postName}>{post.authorName}</div>
            <div className={styles.postTime}>{relativeTime(post.createdAt)}</div>
          </div>
        </div>
        {isMine && (
          <button className={styles.postKebab} aria-label="Mais opções" onClick={onOpenMenu}>
            ⋯
          </button>
        )}
      </div>

      <div className={styles.postText}>{post.content}</div>
      {post.mediaUrl && <img className={styles.postPhoto} src={post.mediaUrl} alt="" loading="lazy" />}

      <div className={styles.reactionBar}>
        <button className={`${styles.reactionBtn} ${post.liked ? styles.active : ''}`} onClick={onToggleLike}>
          <svg viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
            <path d="M12 3l2.2 4.8 5.3.6-4 3.6 1.1 5.2L12 14.8 7.4 17.2l1.1-5.2-4-3.6 5.3-.6z" />
          </svg>
          <span>{post.likesCount} Axé</span>
        </button>
        <button className={`${styles.reactionBtn} ${styles.grow}`} onClick={onToggleComments}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span>{post.commentsCount}</span>
        </button>
      </div>

      {post.showComments && (
        <div className={styles.commentsBox}>
          {post.comments.length ? (
            post.comments.map((cm, idx) => (
              <div className={styles.commentLine} key={idx}>
                <b>{cm.authorName}:</b> {cm.content}
              </div>
            ))
          ) : (
            <div className="empty-hint" style={{ padding: '4px 0' }}>
              {post.commentsLoaded ? 'Nenhum comentário ainda.' : 'Carregando…'}
            </div>
          )}
          <div className={styles.commentInputRow}>
            <input
              type="text"
              placeholder="Escreva com respeito…"
              aria-label="Escrever comentário"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}
