import styles from '../components/shell/AppShell.module.css';

// Placeholder das telas ainda não portadas (Milestones B-E do roteiro de
// migração). Prova que a navegação/roteamento está ligado ponta a ponta;
// cada uma vira uma tela real conforme o milestone correspondente avança.
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className={styles.placeholder}>
      <p>
        <strong>{title}</strong>
      </p>
      <p>Esta tela ainda está sendo migrada.</p>
    </div>
  );
}
