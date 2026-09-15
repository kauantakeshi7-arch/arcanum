import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { Skeleton, SkeletonRow } from '../../components/Skeleton';
import { OnboardingCard } from './OnboardingCard';
import { CovensTeaser } from './CovensTeaser';
import { PostCard } from './PostCard';
import { NewPostModal } from './NewPostModal';
import { FindPeopleModal } from './FindPeopleModal';
import { CovenWallModal } from '../covens/CovenWallModal';
import type { FeedTab } from '../../types/agora';
import styles from './AgoraScreen.module.css';

// Entrada em stagger dos posts ao carregar/trocar de aba — cada card sobe
// e aparece um pouco depois do anterior (fica visualmente "vivo" em vez de
// só aparecer tudo de uma vez).
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
};

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
          <div aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <SkeletonRow />
                <Skeleton height={90} radius={14} />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          <motion.div variants={listVariants} initial="hidden" animate="show" key={feedTab}>
            {filtered.map((post) => (
              <motion.div variants={itemVariants} key={post.id}>
                <PostCard post={post} />
              </motion.div>
            ))}
          </motion.div>
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
