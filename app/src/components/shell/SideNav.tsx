import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import styles from './AppShell.module.css';

export function SideNav() {
  return (
    <nav className={styles.sideNav} aria-label="Navegação principal">
      <div className={styles.brand}>
        <span className={styles.brandMark}>
          <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradSideNav)" strokeWidth="1.1">
            <defs>
              <linearGradient id="gradSideNav" x1="0" y1="0" x2="24" y2="24">
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
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `${styles.sideNavBtn} ${isActive ? styles.sideNavBtnActive : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
