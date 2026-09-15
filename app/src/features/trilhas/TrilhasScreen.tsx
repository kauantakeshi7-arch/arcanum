import { useModal } from '../../components/modal/ModalProvider';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import { TRILHA_MODULES } from './trilhasData';
import { LunarQuestCard } from './LunarQuestCard';
import { LunarQuestModal } from './LunarQuestModal';
import { QuizModal } from './QuizModal';
import { DuelCard } from './DuelCard';
import styles from './TrilhasScreen.module.css';

const LOCK_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 018 0v3" />
  </svg>
);

// Porte de index.html:2235-2269 (renderTrilhas).
export function TrilhasScreen() {
  const { lunarQuests, moduleDoneIds } = useTrilhasData();
  const { push, pop } = useModal();

  function openLunarQuest(questId: string) {
    const quest = lunarQuests.find((q) => q.id === questId);
    if (!quest) return;
    const id = push(<LunarQuestModal quest={quest} onDone={() => pop(id)} />);
  }

  function openQuiz(moduleId: string) {
    const module = TRILHA_MODULES.find((m) => m.id === moduleId);
    if (!module || moduleDoneIds.has(moduleId)) return;
    const id = push(<QuizModal module={module} onDone={() => pop(id)} />);
  }

  let currentAssigned = false;

  return (
    <div className={styles.screen}>
      <LunarQuestCard onOpenQuest={openLunarQuest} />

      <div className="section-head">
        <div className="section-title">Árvore da Sabedoria</div>
        <div className="section-sub">Estude em módulos curtos e evolua seu grau iniciático</div>
      </div>

      <div className={styles.treeWrap}>
        {TRILHA_MODULES.map((m, i) => {
          const done = moduleDoneIds.has(m.id);
          const prevDone = i === 0 || moduleDoneIds.has(TRILHA_MODULES[i - 1].id);
          const locked = !prevDone && !done;
          const isCurrent = !done && !locked && !currentAssigned;
          if (isCurrent) currentAssigned = true;

          return (
            <div className={styles.treeNode} key={m.id}>
              <button
                className={`${styles.nodeDot} ${done ? styles.done : ''} ${locked ? styles.locked : ''} ${isCurrent ? styles.current : ''}`}
                disabled={locked}
                onClick={() => openQuiz(m.id)}
              >
                {done ? '✓' : locked ? LOCK_SVG : i + 1}
              </button>
              <div className={styles.nodeInfo}>
                <div className={styles.nodeTitle}>{m.title}</div>
                <div className={styles.nodeSub}>{m.sub}</div>
                <div className={`${styles.nodeXp} ${done ? styles.doneTag : ''}`}>
                  {done ? '✓ Concluído' : `✦ +${m.xp} Mana ao concluir`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DuelCard />
    </div>
  );
}
