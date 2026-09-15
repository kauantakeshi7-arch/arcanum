import { MOON_PHASE_INFO, getMoonPhase } from '../../lib/moon';
import { useTrilhasData } from '../../context/TrilhasDataContext';
import styles from './TrilhasScreen.module.css';

// Porte de index.html:2130-2157 (renderLunarQuestCard).
export function LunarQuestCard({ onOpenQuest }: { onOpenQuest: (questId: string) => void }) {
  const { lunarQuests } = useTrilhasData();
  if (!lunarQuests.length) return null;

  const currentPhase = getMoonPhase();

  return (
    <div className={`${styles.duelCard} ${styles.lunarCard}`}>
      <div className={`section-title ${styles.duelSectionTitle}`}>🌙 Passe Lunar</div>
      <div className={`section-sub ${styles.lunarSectionSub}`}>
        Ciclo de 28 dias — comprove sua prática em cada fase e ganhe Mana. Hoje: {MOON_PHASE_INFO[currentPhase].glyph}{' '}
        {MOON_PHASE_INFO[currentPhase].label}
      </div>
      <div className={styles.lunarQuestList}>
        {lunarQuests.map((q) => {
          const info = MOON_PHASE_INFO[q.phase];
          const isAvailable = !q.done && q.phase === currentPhase;
          let tag: string;
          if (q.done) tag = '✓ Concluído';
          else if (isAvailable) tag = `Disponível agora · +${q.mana} Mana`;
          else tag = `Disponível na ${info.label}`;

          return (
            <div className={`${styles.lunarQuestRow} ${q.done ? styles.done : ''}`} key={q.id}>
              <div className={styles.lunarQuestGlyph}>{info.glyph}</div>
              <div className={styles.lunarQuestInfo}>
                <div className={styles.lunarQuestTitle}>{q.title}</div>
                <div className={styles.lunarQuestSub}>{q.description}</div>
                <div className={`${styles.lunarQuestTag} ${q.done ? styles.doneTag : ''}`}>{tag}</div>
              </div>
              {isAvailable && (
                <button className={`btn-ghost ${styles.lunarQuestBtn}`} onClick={() => onOpenQuest(q.id)}>
                  Comprovar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
