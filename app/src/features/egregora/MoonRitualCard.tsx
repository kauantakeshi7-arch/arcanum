import { useEffect, useState } from 'react';
import { useToast } from '../../components/toast/ToastProvider';
import { moonCountdownStr } from './egregoraData';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2946-2950, 2981-2986, 3678-3681 (moon-card + btnMoonNotify).
export function MoonRitualCard() {
  const { showToast } = useToast();
  const [countdown, setCountdown] = useState(moonCountdownStr());
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setCountdown(moonCountdownStr()), 60000);
    return () => clearInterval(id);
  }, []);

  function toggleNotify() {
    setNotify((v) => {
      const next = !v;
      showToast(next ? 'Você será lembrado do ritual da Lua Cheia' : 'Lembrete removido');
      return next;
    });
  }

  return (
    <div className={styles.moonCard}>
      <div className="section-title" style={{ fontSize: 17 }}>
        🌕 Ritual Síncrono: Lua Cheia em Touro
      </div>
      <div className={styles.moonCountdown}>{countdown}</div>
      <button className={`${styles.togglePill} ${notify ? styles.on : ''}`} onClick={toggleNotify}>
        {notify ? '✓ Lembrete ativado' : 'Ativar lembrete'}
      </button>
    </div>
  );
}
