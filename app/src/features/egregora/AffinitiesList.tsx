import { useState } from 'react';
import { initials } from '../../lib/constants';
import { AFFINITIES } from './egregoraData';
import styles from './EgregoraScreen.module.css';

const COLORS = ['#8B6CF2', '#34C79A', '#D4A853', '#C1614A'];

// Porte de index.html:2890-2904, 3566-3572 (affinityHtml + toggle connect).
// "Conexões" não tem tabela no banco — local-only, como no app original.
export function AffinitiesList() {
  const [connections, setConnections] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setConnections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div style={{ marginBottom: 18 }}>
      {AFFINITIES.map((a, i) => {
        const connected = connections.has(a.name);
        return (
          <div className={styles.affinityRow} key={a.name}>
            <div className={styles.affinityAvatar} style={{ background: `linear-gradient(145deg, ${COLORS[i % 4]}, ${COLORS[i % 4]}aa)` }}>
              {initials(a.name)}
            </div>
            <div className={styles.affinityInfo}>
              <div className={styles.affinityName}>{a.name}</div>
              <div className={styles.affinitySigns}>
                Sol em {a.sun} · Lua em {a.moon}
              </div>
              <div className={styles.affinityBarTrack}>
                <div className={styles.affinityBarFill} style={{ width: `${a.pct}%` }} />
              </div>
            </div>
            <div className={styles.affinityPct}>{a.pct}%</div>
            <button className={`${styles.togglePill} ${connected ? styles.on : ''}`} onClick={() => toggle(a.name)}>
              {connected ? 'Conectado' : 'Conectar'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
