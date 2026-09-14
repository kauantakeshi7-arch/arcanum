import styles from './AppShell.module.css';

// Fase 1: só a casca. O conteúdo real (frequência do Templo Sonoro, resumo
// do dia etc — portado de index.html renderRightPanel(), linha ~3045) entra
// nas fases seguintes junto com cada tela que o alimenta.
export function RightPanel() {
  return (
    <aside className={styles.rightPanel} aria-label="Resumo e widgets">
      <div className={styles.widgetCard}>
        <div className={styles.widgetTitle}>Templo Sonoro</div>
        <div className={styles.placeholder}>Em breve.</div>
      </div>
    </aside>
  );
}
