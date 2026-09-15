import { useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { OnboardingCard } from './OnboardingCard';
import { CovensTeaser } from './CovensTeaser';
import { PostCard } from './PostCard';
import { NewPostModal } from './NewPostModal';
import { FindPeopleModal } from './FindPeopleModal';
import { CovenWallModal } from '../covens/CovenWallModal';
import type { FeedTab } from '../../types/agora';
import styles from './AgoraScreen.module.css';

const TABS: [FeedTab, string][] = [
  ['para-voce', 'Para Você'],
  ['seguindo', 'Seguindo'],
  ['minha-senda', 'Minha Senda'],
];

// Porte de index.html:2100-2124 (renderAgora/renderAgoraEmptyState).
export function AgoraScreen() {
  const { posts, feedTab, setFeedTab, followingIds, loading, addLocalPost } = useAgoraData();
  const { covens } = useCovensData();
  const { profile } = useSession();
  const navigate = useNavigate();
  const { push, pop } = useModal();

  function openNewPost() {
    const id = push(<NewPostModal onPublished={addLocalPost} onDone={() => pop(id)} />);
  }

  function openFindPeople() {
    push(<FindPeopleModal />);
  }

  function openCovensTeaser(covenId?: string) {
    if (!covenId) {
      navigate('/covens');
      return;
    }
    const coven = covens.find((c) => c.id === covenId);
    if (!coven?.joined) {
      navigate('/covens');
      return;
    }
    push(<CovenWallModal covenId={covenId} />);
  }

  const filtered = posts.filter((p) => {
    if (feedTab === 'minha-senda') return p.trad === profile?.religion_path;
    if (feedTab === 'seguindo') return followingIds.has(p.userId);
    return true;
  });

  return (
    <div>
      <div className={styles.screen}>
        <OnboardingCard onGoToCovens={() => navigate('/covens')} onOpenFindPeople={openFindPeople} onOpenNewPost={openNewPost} />
        <CovensTeaser onOpen={openCovensTeaser} />

        <div className={styles.feedTabs}>
          {TABS.map(([id, label]) => (
            <button
              key={id}
              className={`${styles.feedTab} ${feedTab === id ? styles.active : ''}`}
              onClick={() => setFeedTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty-hint">Carregando…</div>
        ) : filtered.length ? (
          filtered.map((post) => <PostCard post={post} key={post.id} />)
        ) : feedTab === 'seguindo' ? (
          <div className="empty-hint">
            Você ainda não segue ninguém. Siga outras pessoas para ver as publicações delas aqui.
            <button className="btn-ghost" style={{ width: '100%', marginTop: 12 }} onClick={openFindPeople}>
              🔎 Buscar pessoas
            </button>
          </div>
        ) : (
          <div className="empty-hint">Nada por aqui ainda nesta senda. Que tal ser a primeira pessoa a publicar?</div>
        )}
      </div>
    </div>
  );
}
