import { GLYPH, tradColor } from '../../lib/constants';
import { useCovensData } from '../../context/CovensDataContext';
import styles from './AgoraScreen.module.css';

// Porte de index.html:2023-2044 (renderCovensTeaser).
export function CovensTeaser({ onOpen }: { onOpen: (covenId?: string) => void }) {
  const { covens } = useCovensData();
  const joined = covens.filter((c) => c.joined);
  const visible = joined.slice(0, 4);
  const extra = joined.length - visible.length;

  return (
    <>
      <div className={styles.covensTeaser} role="button" tabIndex={0} onClick={() => onOpen()}>
        <div className={styles.covensTeaserIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9.3" />
            <path d="M12 7c1.6 2.1 2.1 3.4 2.1 4.4a2.1 2.1 0 11-4.2 0C9.9 10.4 10.4 9.1 12 7z" />
          </svg>
        </div>
        <div className={styles.covensTeaserText}>
          <div className={styles.covensTeaserTitle}>Covens & Terreiros</div>
          <div className={styles.covensTeaserSub}>
            {joined.length
              ? `Você faz parte de ${joined.length} coven${joined.length > 1 ? 's' : ''}`
              : 'Crie ou entre numa comunidade da sua tradição'}
          </div>
        </div>
        <div className={styles.covensTeaserArrow}>→</div>
      </div>
      {visible.length > 0 && (
        <div className={styles.covensTeaserChips}>
          {visible.map((c) => {
            const col = tradColor(c.tradition);
            return (
              <button
                key={c.id}
                className={styles.covensTeaserChip}
                style={{ borderColor: `${col}55` }}
                onClick={() => onOpen(c.id)}
              >
                <span style={{ color: col }}>{GLYPH[c.tradition] || '✦'}</span> {c.name}
              </button>
            );
          })}
          {extra > 0 && (
            <button className={styles.covensTeaserChip} onClick={() => onOpen()}>
              +{extra}
            </button>
          )}
        </div>
      )}
    </>
  );
}
