import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { RightPanel } from './RightPanel';
import { useModal } from '../modal/ModalProvider';
import styles from './AppShell.module.css';

// Busca e DM ficam clicáveis mas sem ação real na Fase 1 — ganham
// comportamento junto com Milestone A/E. O sino de notificações já abre um
// modal de demonstração só para provar o ModalProvider ponta a ponta.
export function AppShell() {
  const { push } = useModal();

  function openNotificationsDemo() {
    push(
      <div>
        <h2 className={styles.widgetTitle} style={{ marginBottom: 12 }}>
          Notificações
        </h2>
        <p style={{ color: 'var(--text-mid)', fontSize: 13.5 }}>
          Esta tela ainda está sendo migrada — o objetivo aqui é só provar que
          o modal abre e fecha (Esc ou clique fora) corretamente.
        </p>
      </div>,
    );
  }

  return (
    <div className={styles.shell}>
      <SideNav />
      <div className={styles.mainCol}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>
              <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradTopbar)" strokeWidth="1.1">
                <defs>
                  <linearGradient id="gradTopbar" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#D4A853" />
                    <stop offset="100%" stopColor="#8B6CF2" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="12" r="9.3" />
                <path d="M12 2.7 L19.5 17.3 H4.5 Z" />
              </svg>
            </span>
            <span className={styles.brandName}>Arcanum</span>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn} aria-label="Buscar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
            </button>
            <button className={styles.iconBtn} aria-label="Ver notificações" onClick={openNotificationsDemo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 01-3.4 0" />
              </svg>
            </button>
            <button className={styles.iconBtn} aria-label="Abrir mensagens diretas">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.screens}>
          <Outlet />
          <button className={styles.fab} aria-label="Nova publicação" title="Nova publicação">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <BottomNav />
      </div>

      <RightPanel />
    </div>
  );
}
