import { useState } from 'react';
import { GLYPH, initials, tradColor, tradLabel } from '../../lib/constants';
import { useAgoraData } from '../../context/AgoraDataContext';
import type { PostViewModel } from '../../types/agora';
import styles from './PostCard.module.css';

// Porte de index.html:2045-2098 (renderPostCard).
export function PostCard({ post }: { post: PostViewModel }) {
  const { toggleLike, toggleRepost, toggleSave, toggleComments, sendComment } = useAgoraData();
  const [draft, setDraft] = useState('');
  const c = tradColor(post.trad);

  function handleSend() {
    const value = draft.trim();
    if (!value) return;
    setDraft('');
    sendComment(post.id, value).catch((err) => console.error(err));
  }

  return (
    <div className={styles.card}>
      <div className={styles.postAccent} style={{ background: `linear-gradient(90deg, ${c}, ${c}00)` }} />
      <div className={styles.postHead}>
        <button className={styles.postHeadLink}>
          <div
            className={styles.avatarSm}
            style={{ background: `linear-gradient(145deg, ${c}, ${c}cc)`, boxShadow: `0 0 0 2px ${c}33, 0 3px 8px ${c}40` }}
          >
            {initials(post.user)}
          </div>
          <div className={styles.postMeta}>
            <div className={styles.postName}>
              {post.user}
              {post.verified && (
                <svg className={styles.verifiedBadge} viewBox="0 0 24 24" fill="currentColor" aria-label="Perfil verificado">
                  <path d="M12 2l2.4 2.1 3.1-.4 1 3 2.9 1.4-.6 3.1 1.9 2.5-1.9 2.5.6 3.1-2.9 1.4-1 3-3.1-.4L12 22l-2.4-2.1-3.1.4-1-3-2.9-1.4.6-3.1L1.3 10l1.9-2.5-.6-3.1L5.5 3l1-3 3.1.4z" />
                  <path d="M9 12.5l2 2 4-4.5" fill="none" stroke="#1a1420" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className={styles.postSub}>
              <span className={styles.tradBadge} style={{ color: c, borderColor: `${c}55`, background: `${c}14` }}>
                {GLYPH[post.trad] || '✦'} {tradLabel(post.trad)}
              </span>
              <span className={styles.postTime}>{post.time}</span>
            </div>
          </div>
        </button>
        <button className={styles.postKebab} aria-label="Mais opções">
          ⋯
        </button>
      </div>

      <div className={styles.postText}>{post.content}</div>
      {post.type === 'altar_photo' && post.media[0] && (
        <img className={styles.postPhoto} src={post.media[0]} alt="Foto do altar" loading="lazy" />
      )}
      {post.type === 'quest_proof' && (
        <>
          <div className={styles.questProofTag}>🌙 Passe Lunar</div>
          {post.media[0] && <img className={styles.postPhoto} src={post.media[0]} alt="Comprovação da missão" loading="lazy" />}
        </>
      )}
      {post.type === 'oracle_reading' && post.cards.length > 0 && (
        <div className={styles.oracleCardsRow}>
          {post.cards.map((cardName) => (
            <div className={styles.miniTarot} key={cardName}>
              {cardName}
            </div>
          ))}
        </div>
      )}

      <div className={styles.reactionBar}>
        <button
          className={`${styles.reactionBtn} ${post.liked ? styles.active : ''}`}
          onClick={() => toggleLike(post.id)}
        >
          <svg viewBox="0 0 24 24" fill={post.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
            <path d="M12 3l2.2 4.8 5.3.6-4 3.6 1.1 5.2L12 14.8 7.4 17.2l1.1-5.2-4-3.6 5.3-.6z" />
          </svg>
          <span>{post.blessings} Axé</span>
        </button>
        <button
          className={`${styles.reactionBtn} ${styles.repost} ${post.reposted ? styles.active : ''}`}
          onClick={() => toggleRepost(post.id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M17 2l4 4-4 4M3 12v-2a4 4 0 014-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 01-4 4H3" />
          </svg>
          <span>{post.reposts}</span>
        </button>
        <button
          className={`${styles.reactionBtn} ${styles.save} ${post.saved ? styles.active : ''}`}
          onClick={() => toggleSave(post.id)}
        >
          <svg viewBox="0 0 24 24" fill={post.saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6">
            <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" />
          </svg>
        </button>
        <button className={`${styles.reactionBtn} ${styles.grow}`} onClick={() => toggleComments(post.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          <span>{post.comments.length}</span>
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
            <div className={styles.emptyHint} style={{ padding: '4px 0' }}>
              Nenhum comentário ainda. Seja a primeira voz.
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
