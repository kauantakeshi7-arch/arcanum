import { useState } from 'react';
import { useEgregoraData } from '../../context/EgregoraDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2906-2915, 2961-2967, 3573-3587 (Mural de Firmezas).
export function CandlesMural() {
  const { candles, lightCandle, addCandle } = useEgregoraData();
  const { showToast } = useToast();
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    const value = draft.trim();
    if (!value || adding) return;
    setAdding(true);
    try {
      await addCandle(value);
      setDraft('');
      showToast('Vela acesa no Mural de Firmezas ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível acender a vela agora.');
    } finally {
      setAdding(false);
    }
  }

  async function handleLight(id: string) {
    try {
      await lightCandle(id);
      showToast('Pensamento firmado ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível firmar o pensamento agora.');
    }
  }

  return (
    <>
      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          Mural de Firmezas
        </div>
        <div className="section-sub">Corrente de Luz — acenda uma vela por quem precisa</div>
      </div>
      <div className="form-field" style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12 }}>
        <input
          type="text"
          aria-label="Escrever intenção para a vela"
          placeholder="Escreva uma intenção…"
          style={{ flex: 1 }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn-ghost" disabled={adding} onClick={handleAdd}>
          Acender
        </button>
      </div>
      <div style={{ marginBottom: 18 }}>
        {candles.map((c) => (
          <div className={styles.candleItem} key={c.id}>
            <div className={styles.candleFlameMini}>🕯️</div>
            <div className={styles.candleBody}>
              <div className={styles.candleIntention}>
                "{c.intention}" — {c.by}
              </div>
              <div className={styles.candleLights}>{c.lights} luzes acesas</div>
            </div>
            <button className={`${styles.lightBtn} ${c.lit ? styles.active : ''}`} disabled={c.lit} onClick={() => handleLight(c.id)}>
              {c.lit ? '✦ Firme' : '+1 Luz'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
