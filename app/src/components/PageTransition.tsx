import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// Transição sutil de fade + slide ao trocar de rota (Ágora/Covens/Trilhas/
// Altar/Egrégora/Perfil). Usa transform/opacity (barato, sem reflow) e
// respeita prefers-reduced-motion via variants condicionais.
const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const variants = prefersReducedMotion
  ? { initial: {}, animate: {}, exit: {} }
  : {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    };

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
