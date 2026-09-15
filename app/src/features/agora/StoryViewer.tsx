import { useEffect, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { initials, relativeTime, tradColor } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import type { StoryGroup } from '../../types/agora';
import styles from './Stories.module.css';

const ITEM_DURATION_MS = 5000;
const TICK_MS = 50;

// Porte de index.html:1850-1935 (openStoryViewer/showStoryItem/next/prevStoryItem).
export function StoryViewer({ order, startGroupIndex, onClose }: {
  order: StoryGroup[];
  startGroupIndex: number;
  onClose: () => void;
}) {
  const { profile } = useSession();
  const { markStorySeen } = useAgoraData();
  const [groupIndex, setGroupIndex] = useState(startGroupIndex);
  const [itemIndex, setItemIndex] = useState(0);
  const [pct, setPct] = useState(0);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const pausedRef = useRef(false);

  const group = order[groupIndex];
  const item = group?.items[itemIndex];
  const isMine = group?.userId === profile?.id;

  function next() {
    if (itemIndex < group.items.length - 1) {
      setItemIndex((i) => i + 1);
    } else if (groupIndex < order.length - 1) {
      setGroupIndex((g) => g + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  }

  function prev() {
    if (itemIndex > 0) setItemIndex((i) => i - 1);
    else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1);
      setItemIndex(order[groupIndex - 1].items.length - 1);
    }
  }

  useEffect(() => {
    if (!item) return;
    setPct(0);
    setViewCount(null);
    if (isMine) {
      api.fetchStoryViewCount(item.id).then(setViewCount).catch(() => {});
    } else {
      markStorySeen(item.id);
      api.createNotification(group.userId, profile!.id, 'story_view', item.id).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id]);

  useEffect(() => {
    if (!item) return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      setPct((p) => {
        const next = p + (100 * TICK_MS) / ITEM_DURATION_MS;
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, itemIndex]);

  useEffect(() => {
    if (pct >= 100) next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  if (!group || !item) return null;
  const c = tradColor(group.trad);

  return (
    <div className={styles.viewerOverlay}>
      <div className={styles.viewerBars}>
        {group.items.map((_, i) => (
          <div className={styles.barTrack} key={i}>
            <div
              className={styles.barFill}
              style={{ width: `${i < itemIndex ? 100 : i === itemIndex ? Math.min(100, pct) : 0}%` }}
            />
          </div>
        ))}
      </div>
      <div className={styles.viewerHead}>
        <div className={styles.avatarSm} style={{ background: `linear-gradient(145deg, ${c}, ${c}cc)` }}>
          {initials(group.name)}
        </div>
        <div className={styles.viewerInfo}>
          <div className={styles.viewerName}>{isMine ? 'Você' : group.name}</div>
          <div className={styles.viewerTime}>{relativeTime(item.createdAt)}</div>
        </div>
        <button className={styles.viewerClose} aria-label="Fechar" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className={styles.viewerContent}>
        {item.mediaUrl ? (
          <img src={item.mediaUrl} alt="" />
        ) : (
          <div className={styles.textCard} style={{ background: `linear-gradient(160deg, ${item.bgColor || '#8B6CF2'}, #0A0918)` }}>
            {item.textContent}
          </div>
        )}
        <div className={styles.viewerNav}>
          <div className={styles.viewerNavZone} onClick={prev} />
          <div className={styles.viewerNavZone} onClick={next} />
        </div>
      </div>
      {isMine && (
        <div className={styles.viewerViewCount}>
          {viewCount === null ? '···' : `👁 ${viewCount} ${viewCount === 1 ? 'visualização' : 'visualizações'}`}
        </div>
      )}
    </div>
  );
}
