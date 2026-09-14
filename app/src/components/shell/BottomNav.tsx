import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navItems';
import styles from './AppShell.module.css';

export function BottomNav() {
  return (
    <div className={styles.bottomNav} aria-label="Navegação principal">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.key}
          to={item.path}
          end={item.path === '/'}
          className={({ isActive }) => `${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
