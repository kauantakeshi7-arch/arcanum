// Ícones e rótulos portados de ../../../../index.html:1288-1311 (side-nav) e
// 1412-1435 (bottom-nav) — os dois lugares usavam os mesmos SVGs duplicados;
// aqui viram uma única fonte de verdade.
import type { ReactNode } from 'react';

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'agora',
    label: 'Ágora',
    path: '/',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9a1 1 0 001 1h11a1 1 0 001-1v-9" />
      </svg>
    ),
  },
  {
    key: 'covens',
    label: 'Covens',
    path: '/covens',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.3" />
        <path d="M12 7c1.6 2.1 2.1 3.4 2.1 4.4a2.1 2.1 0 11-4.2 0C9.9 10.4 10.4 9.1 12 7z" />
      </svg>
    ),
  },
  {
    key: 'trilhas',
    label: 'Trilhas',
    path: '/trilhas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 21V9" />
        <path d="M12 9c0-3 2-5 6-5-1 4-3 5-6 5z" />
        <path d="M12 13c0-3-2-5-6-5 1 4 3 5 6 5z" />
      </svg>
    ),
  },
  {
    key: 'santuario',
    label: 'Altar',
    path: '/altar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3c1.2 2 1.8 3.4 1.8 4.6A1.8 1.8 0 0112 9.4a1.8 1.8 0 01-1.8-1.8C10.2 6.4 10.8 5 12 3z" />
        <path d="M8 21v-6a4 4 0 018 0v6" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    key: 'egregora',
    label: 'Egrégora',
    path: '/egregora',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="6" cy="7" r="2.4" />
        <circle cx="18" cy="7" r="2.4" />
        <circle cx="12" cy="18" r="2.6" />
        <path d="M8 8.5 10.3 16M16 8.5 13.7 16M8.3 7h7.4" />
      </svg>
    ),
  },
  {
    key: 'perfil',
    label: 'Perfil',
    path: '/perfil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" />
      </svg>
    ),
  },
];
