import { useSession } from '../../context/SessionContext';
import styles from './SantuarioScreen.module.css';

// Porte de index.html:2451-2457.
export function StreakRow() {
  const { profile } = useSession();
  return (
    <div className={styles.streakRow}>
      <div className={styles.streakFlame}>🔥</div>
      <div>
        <div className={styles.streakNum}>{profile?.streak_days ?? 0} dias</div>
        <div className={styles.streakLabel}>Chama Sagrada acesa — escreva hoje para não apagar</div>
      </div>
    </div>
  );
}
