import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { computeBadges, type BadgeStats } from './perfilData';

// Porte de index.html:3949-3957 (renderBadgesGrid). Reaproveitado por
// PerfilScreen e pelo perfil público (ProfileModal).
//
// Micro-celebração (Fase 3 do plano de UX): quando um badge passa de
// locked→achieved DEPOIS da carga inicial (ex: ganhou mana e cruzou o
// limiar), ele "estoura" com um pop de escala + glow dourado. No primeiro
// render (stats ainda carregando/chegando), nada é celebrado — só
// diferenças subsequentes contam como "acabei de desbloquear".
export function BadgesGrid({ stats }: { stats: BadgeStats }) {
  const badges = computeBadges(stats);
  const prevAchieved = useRef<Set<string> | null>(null);
  const newlyUnlocked = new Set(
    prevAchieved.current
      ? badges.filter((b) => b.achieved && !prevAchieved.current!.has(b.id)).map((b) => b.id)
      : [],
  );

  useEffect(() => {
    prevAchieved.current = new Set(badges.filter((b) => b.achieved).map((b) => b.id));
  });

  return (
    <div className="badges-grid">
      {badges.map((b) => (
        <motion.div
          key={b.id}
          className={`badge-item ${b.achieved ? 'achieved' : 'locked'}`}
          title={b.achieved ? b.label : b.hint}
          initial={false}
          animate={
            newlyUnlocked.has(b.id)
              ? { scale: [1, 1.25, 1], boxShadow: ['0 0 0 rgba(212,168,83,0)', '0 0 22px rgba(212,168,83,0.7)', '0 0 10px rgba(212,168,83,0.12)'] }
              : {}
          }
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="badge-icon">{b.icon}</div>
          <div className="badge-label">{b.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
