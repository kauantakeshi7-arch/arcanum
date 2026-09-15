import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import styles from './AgoraScreen.module.css';

// Porte de index.html:1996-2022 (renderOnboardingCard).
export function OnboardingCard({ onGoToCovens, onOpenFindPeople, onOpenNewPost }: {
  onGoToCovens: () => void;
  onOpenFindPeople: () => void;
  onOpenNewPost: () => void;
}) {
  const { profile } = useSession();
  const { posts, covens, followingIds, onboardingDismissed, dismissOnboarding } = useAgoraData();
  if (onboardingDismissed || !profile) return null;

  const hasFollow = followingIds.size > 0;
  const hasCoven = covens.some((c) => c.joined);
  const hasPost = posts.some((p) => p.userId === profile.id);
  if (hasFollow && hasCoven && hasPost) return null;

  const steps = [
    { done: hasFollow, label: 'Siga alguém que ressoe com você', action: onOpenFindPeople },
    { done: hasCoven, label: 'Entre ou funde um Coven', action: onGoToCovens },
    { done: hasPost, label: 'Compartilhe sua primeira reflexão', action: onOpenNewPost },
  ];

  return (
    <div className={styles.onboardingCard}>
      <div className={styles.onboardingHead}>
        <div className={styles.onboardingTitle}>✦ Bem-vindo(a) ao Arcanum</div>
        <button className={styles.onboardingClose} aria-label="Fechar" onClick={dismissOnboarding}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <div className={styles.onboardingSub}>Três passos rápidos para começar sua jornada</div>
      {steps.map((s) => (
        <button
          key={s.label}
          className={`${styles.onboardingStep} ${s.done ? styles.done : ''}`}
          onClick={s.done ? undefined : s.action}
        >
          <span className={styles.onboardingCheck}>{s.done ? '✓' : ''}</span>
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
