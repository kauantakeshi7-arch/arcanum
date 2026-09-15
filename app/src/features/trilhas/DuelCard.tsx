import { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { LEADERBOARD } from './trilhasData';
import styles from './TrilhasScreen.module.css';

const RANK_CLASS = ['gold', 'silver', 'bronze'];

// Porte de index.html:2261-2356 (renderTrilhas' duel-card, renderLeaderboard, startDuel).
// Duelos são inteiramente mock (sem tabela no banco) — mesmo comportamento do app original.
export function DuelCard() {
  const { profile, adjustManaXp } = useSession();
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<{ opponent: string; win: boolean; reward: number } | null>(null);

  const rows = [...LEADERBOARD, { name: 'Você', mana: profile?.mana_xp || 0, me: true }].sort((a, b) => b.mana - a.mana);

  function startDuel() {
    if (searching) return;
    setSearching(true);
    setTimeout(() => {
      const opponent = LEADERBOARD[Math.floor(Math.random() * LEADERBOARD.length)];
      const win = Math.random() > 0.42;
      const reward = win ? 30 : 10;
      if (win) adjustManaXp(reward);
      setResult({ opponent: opponent.name, win, reward });
      setSearching(false);
    }, 1600);
  }

  return (
    <div className={styles.duelCard}>
      <div className={`section-title ${styles.duelSectionTitle}`}>
        <svg className={styles.duelIcon} viewBox="0 0 24 24" fill="none" stroke="#E8C989" strokeWidth="1.6">
          <path d="M6.5 17.5 17 7M14 4l6 6-3 1-4-4zM3 21l3-1 1-3" />
        </svg>{' '}
        Duelos Arcanos
      </div>
      <div className="section-sub">PvP de conhecimento — 5 perguntas, 60 segundos, glória e Mana</div>
      <button className="btn-primary" disabled={searching} onClick={startDuel}>
        {searching ? 'Buscando…' : 'Buscar Oponente'}
      </button>

      {result && (
        <div style={{ marginTop: 14 }}>
          <div className="modal-title" style={{ fontSize: 17, marginBottom: 6 }}>
            {result.win ? 'Vitória Arcana! 🔥' : 'Boa luta ✦'}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-mid)', marginBottom: 10 }}>
            Você duelou contra <b style={{ color: 'var(--text-hi)' }}>{result.opponent}</b> em conhecimento de simbologia.
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: result.win ? 'var(--emerald)' : 'var(--gold-soft)' }}>
            {result.win ? '5 x 3' : '2 x 5'}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-low)', marginBottom: 4 }}>+{result.reward} Mana</div>
        </div>
      )}

      <div className={styles.leaderboard}>
        <div className="node-sub" style={{ marginBottom: 6, textAlign: 'left' }}>
          Ranking Semanal de Magistas
        </div>
        {rows.map((r, i) => (
          <div className={`${styles.lbRow} ${'me' in r && r.me ? styles.meRow : ''}`} key={r.name}>
            <span className={`${styles.lbRank} ${RANK_CLASS[i] ? styles[RANK_CLASS[i] as 'gold' | 'silver' | 'bronze'] : ''}`}>{i + 1}</span>
            <span className={`${styles.lbName} ${'me' in r && r.me ? styles.me : ''}`}>{r.name}</span>
            <span className={styles.lbMana}>{r.mana} Mana</span>
          </div>
        ))}
      </div>
    </div>
  );
}
