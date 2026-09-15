// Porte de index.html:1941-1955 (MOON_PHASE_INFO/getMoonPhase) — mesmo
// algoritmo (fase sinódica aproximada a partir de uma lua nova conhecida).
export type MoonPhase = 'nova' | 'crescente' | 'cheia' | 'minguante';

export const MOON_PHASE_INFO: Record<MoonPhase, { label: string; glyph: string }> = {
  nova: { label: 'Lua Nova', glyph: '🌑' },
  crescente: { label: 'Lua Crescente', glyph: '🌓' },
  cheia: { label: 'Lua Cheia', glyph: '🌕' },
  minguante: { label: 'Lua Minguante', glyph: '🌗' },
};

export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const synodic = 29.530588853;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const diffDays = (date.getTime() - knownNewMoon) / 86400000;
  const phase = ((diffDays % synodic) + synodic) % synodic;
  if (phase < 1.84566 || phase > synodic - 1.84566) return 'nova';
  if (phase < 14.765) return 'crescente';
  if (phase < 16.61) return 'cheia';
  return 'minguante';
}
