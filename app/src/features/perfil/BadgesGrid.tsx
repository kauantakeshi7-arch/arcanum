import { computeBadges, type BadgeStats } from './perfilData';

// Porte de index.html:3949-3957 (renderBadgesGrid). Reaproveitado por
// PerfilScreen e pelo perfil público (ProfileModal).
export function BadgesGrid({ stats }: { stats: BadgeStats }) {
  const badges = computeBadges(stats);
  return (
    <div className="badges-grid">
      {badges.map((b) => (
        <div
          key={b.id}
          className={`badge-item ${b.achieved ? 'achieved' : 'locked'}`}
          title={b.achieved ? b.label : b.hint}
        >
          <div className="badge-icon">{b.icon}</div>
          <div className="badge-label">{b.label}</div>
        </div>
      ))}
    </div>
  );
}
