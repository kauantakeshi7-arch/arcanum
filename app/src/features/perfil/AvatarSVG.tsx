import { tradColor } from '../../lib/constants';
import { familiarStage, gradeOf, robeColorForGrade, shopItem, type ShopCategory } from './perfilData';
import type { Profile } from '../../types/db';

// Porte literal de index.html:3120-3147 (renderAvatarSVG).
export function AvatarSVG({ profile }: { profile: Profile }) {
  const layers = profile.avatar_layers || { aura: 'default', robe: 'default', item: 'default' };
  const grade = gradeOf(profile.mana_xp);
  const robe = shopItem('robe' as ShopCategory, layers.robe).color || robeColorForGrade(grade);
  const stage = familiarStage(profile.mana_xp);
  const auraColor = shopItem('aura' as ShopCategory, layers.aura).color || tradColor(profile.religion_path);

  let familiar;
  if (stage === 0) {
    familiar = <ellipse cx="100" cy="118" rx="10" ry="13" fill="#E8C989" />;
  } else if (stage === 1) {
    familiar = (
      <>
        <circle cx="100" cy="118" r="11" fill="#8B6CF2" />
        <circle cx="96" cy="115" r="1.6" fill="#fff" />
        <circle cx="104" cy="115" r="1.6" fill="#fff" />
      </>
    );
  } else if (stage === 2) {
    familiar = (
      <>
        <path d="M85 122 Q100 100 115 122 Q108 132 100 128 Q92 132 85 122Z" fill="#34C79A" />
        <circle cx="96" cy="115" r="1.6" fill="#fff" />
        <circle cx="104" cy="115" r="1.6" fill="#fff" />
      </>
    );
  } else {
    familiar = (
      <>
        <path d="M78 122 Q100 92 122 122 Q112 140 100 132 Q88 140 78 122Z" fill="url(#familiarGrad)" />
        <circle cx="96" cy="112" r="1.8" fill="#fff" />
        <circle cx="104" cy="112" r="1.8" fill="#fff" />
      </>
    );
  }

  return (
    <>
      <div className="aura-glow" style={{ background: `radial-gradient(circle, ${auraColor}, transparent 70%)` }} />
      <svg className="avatar-svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={robe} />
            <stop offset="100%" stopColor="#12131c" />
          </linearGradient>
          <radialGradient id="familiarGrad">
            <stop offset="0%" stopColor="#F5D98A" />
            <stop offset="100%" stopColor="#D4A853" />
          </radialGradient>
        </defs>
        <path
          d="M55 190 C50 130 60 90 100 90 C140 90 150 130 145 190 Z"
          fill="url(#robeGrad)"
          stroke={auraColor}
          strokeWidth="1"
          opacity="0.95"
        />
        <circle cx="100" cy="62" r="26" fill="#e9c9a0" />
        <path d="M74 55 a26 26 0 0152 0 q0 -22 -26 -24 q-26 2 -26 24z" fill={robe} />
        <circle cx="91" cy="63" r="2" fill="#2a2333" />
        <circle cx="109" cy="63" r="2" fill="#2a2333" />
        {familiar}
      </svg>
    </>
  );
}
