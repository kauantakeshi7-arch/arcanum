import { useState } from 'react';
import { initials, tradColor } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { Skeleton } from '../../components/Skeleton';
import { StoryViewer } from './StoryViewer';
import { NewStoryModal } from './NewStoryModal';
import type { StoryGroup } from '../../types/agora';
import styles from './Stories.module.css';

function storyGroupSeen(g: StoryGroup, storyViewIds: Set<string>): boolean {
  return g.items.every((it) => storyViewIds.has(it.id));
}

function storyViewerOrder(storiesByUser: StoryGroup[], myUserId: string | undefined, storyViewIds: Set<string>) {
  return [...storiesByUser].sort((a, b) => {
    if (a.userId === myUserId) return -1;
    if (b.userId === myUserId) return 1;
    return (storyGroupSeen(a, storyViewIds) ? 1 : 0) - (storyGroupSeen(b, storyViewIds) ? 1 : 0);
  });
}

// Porte de index.html:1726-1753 (renderStories).
export function Stories() {
  const { session, profile } = useSession();
  const { storiesByUser, storyViewIds, loading } = useAgoraData();
  const { push, pop } = useModal();
  const [viewer, setViewer] = useState<{ order: StoryGroup[]; startIndex: number } | null>(null);

  if (loading) {
    return (
      <div className={styles.stories} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <div className={styles.story} key={i}>
            <Skeleton width={56} height={56} radius="50%" />
          </div>
        ))}
      </div>
    );
  }

  const myGroup = storiesByUser.find((g) => g.userId === session?.user.id);
  const others = storiesByUser
    .filter((g) => g.userId !== session?.user.id)
    .sort((a, b) => (storyGroupSeen(a, storyViewIds) ? 1 : 0) - (storyGroupSeen(b, storyViewIds) ? 1 : 0));

  function openNewStory() {
    const id = push(<NewStoryModal onDone={() => pop(id)} />);
  }

  function openViewer(userId: string) {
    const order = storyViewerOrder(storiesByUser, session?.user.id, storyViewIds);
    const startIndex = order.findIndex((g) => g.userId === userId);
    if (startIndex === -1 || !order[startIndex].items.length) return;
    setViewer({ order, startIndex });
  }

  return (
    <>
      <div className={styles.stories}>
        {myGroup && myGroup.items.length ? (
          <button className={styles.story} onClick={() => openViewer(myGroup.userId)}>
            <div className={styles.storyRing}>
              <div className={styles.storyAvatar}>{initials(profile?.display_name || '')}</div>
              <span
                className={styles.storyAddBadge}
                role="button"
                aria-label="Adicionar story"
                onClick={(e) => {
                  e.stopPropagation();
                  openNewStory();
                }}
              >
                +
              </span>
            </div>
            <div className={styles.storyName}>Você</div>
          </button>
        ) : (
          <button className={`${styles.story} ${styles.storyAdd}`} onClick={openNewStory}>
            <div className={styles.storyRing}>
              <div className={styles.storyAvatar}>+</div>
            </div>
            <div className={styles.storyName}>Você</div>
          </button>
        )}

        {others.map((g) => {
          const c = tradColor(g.trad);
          const seen = storyGroupSeen(g, storyViewIds);
          return (
            <button className={styles.story} key={g.userId} onClick={() => openViewer(g.userId)}>
              <div className={`${styles.storyRing} ${seen ? styles.seen : ''}`}>
                <div className={styles.storyAvatar} style={{ background: `linear-gradient(155deg, ${c}, ${c}aa)`, color: '#07080C' }}>
                  {initials(g.name)}
                </div>
              </div>
              <div className={styles.storyName}>{g.name}</div>
            </button>
          );
        })}
      </div>

      {viewer && (
        <StoryViewer order={viewer.order} startGroupIndex={viewer.startIndex} onClose={() => setViewer(null)} />
      )}
    </>
  );
}
