import { useState } from 'react';
import { ORACLE_POOL } from './santuarioData';
import type { OracleCard as OracleCardModel } from '../../types/santuario';
import styles from './SantuarioScreen.module.css';

// Porte de index.html:2420-2438, 4811-4820 (oracleHtml/revealOracle). O
// "já revelado hoje" é só de sessão no app original (some ao recarregar).
export function OracleCard() {
  const [revealed, setRevealed] = useState(false);
  const [card, setCard] = useState<OracleCardModel | null>(null);
  const [flipping, setFlipping] = useState(false);

  function reveal() {
    const picked = ORACLE_POOL[Math.floor(Math.random() * ORACLE_POOL.length)];
    setCard(picked);
    setFlipping(true);
    setTimeout(() => setRevealed(true), 750);
  }

  return (
    <>
      <div className={styles.oracleFlipWrap}>
        <div className={`${styles.oracleFlip} ${flipping ? styles.flipped : ''}`}>
          <div className={`${styles.oracleFace} ${styles.oracleFront}`}>
            {!revealed && (
              <>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gold-soft)" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3 19.5 17H4.5Z" />
                </svg>
                <div className="node-sub" style={{ marginTop: 10 }}>
                  Toque para revelar a carta do amanhecer
                </div>
              </>
            )}
          </div>
          <div className={`${styles.oracleFace} ${styles.oracleBack}`}>
            {card && (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold-soft)', marginBottom: 6 }}>
                  {card.name}
                </div>
                <div className="node-sub">{card.meaning}</div>
              </>
            )}
          </div>
        </div>
      </div>
      {!revealed ? (
        <button className="btn-ghost" style={{ width: '100%', marginBottom: 16 }} onClick={reveal}>
          Revelar Carta do Dia
        </button>
      ) : (
        <div className="node-sub" style={{ textAlign: 'center', marginBottom: 16 }}>
          Sua carta já foi revelada por hoje — volte ao amanhecer.
        </div>
      )}
    </>
  );
}
