import { GLYPH, tradColor, tradLabel } from '../../lib/constants';
import type { CovenListItem } from '../../types/covens';
import styles from './CovensScreen.module.css';

// Porte de index.html:3006-3019 (covenCardHtml).
export function CovenCard({ coven, onOpen, onToggleJoin }: {
  coven: CovenListItem;
  onOpen: () => void;
  onToggleJoin: () => void;
}) {
  const col = tradColor(coven.tradition);
  return (
    <div className={styles.cardBig}>
      <div className={styles.cardBanner} style={{ background: `linear-gradient(135deg, ${col}55, ${col}11)` }}>
        <div className={styles.glyphLg} style={{ background: col, color: '#07080C' }}>
          {GLYPH[coven.tradition] || '✦'}
        </div>
      </div>
      <button className={styles.cardBody} onClick={onOpen}>
        <div className={styles.cardName}>{coven.name}</div>
        <div className={styles.cardMeta}>
          {tradLabel(coven.tradition)} · {coven.memberCount} membro{coven.memberCount === 1 ? '' : 's'}
        </div>
        {coven.description && <div className={styles.cardDesc}>{coven.description}</div>}
      </button>
      <button
        className={`${coven.joined ? 'btn-ghost' : 'btn-primary'} ${styles.cardBtn}`}
        onClick={onToggleJoin}
      >
        {coven.joined ? 'Membro ✓' : 'Entrar'}
      </button>
    </div>
  );
}
