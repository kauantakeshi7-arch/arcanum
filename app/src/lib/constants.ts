// Porte literal de index.html:1512-1542 (GLYPH, TRADITIONS, tradColor/tradLabel,
// initials) e :4826-4833 (relativeTime). Mesmos valores, sem tradução.
export const GLYPH: Record<string, string> = {
  umbanda: '☽',
  quimbanda: '🜂',
  candomble: '🜃',
  luciferianismo: '⚚',
  thelema: '☉',
  wicca: '☾',
  hermetismo: '☿',
  espiritismo: '✦',
  xamanismo: '🜃',
  caos: '✳',
  solitario: '✧',
};

export const TRADITIONS: Record<string, { label: string; color: string }> = {
  umbanda: { label: 'Umbanda', color: '#34C79A' },
  quimbanda: { label: 'Quimbanda', color: '#C1614A' },
  candomble: { label: 'Candomblé', color: '#C98A3A' },
  luciferianismo: { label: 'Luciferianismo', color: '#B23B4E' },
  thelema: { label: 'Thelema', color: '#8B6CF2' },
  wicca: { label: 'Bruxaria / Wicca', color: '#5FA37A' },
  hermetismo: { label: 'Hermetismo', color: '#D4A853' },
  espiritismo: { label: 'Espiritismo', color: '#7C97B5' },
  xamanismo: { label: 'Xamanismo', color: '#A9793F' },
  caos: { label: 'Magia do Caos', color: '#9B5DB0' },
  solitario: { label: 'Buscador Solitário', color: '#8B87A0' },
};

export function tradColor(t: string): string {
  return (TRADITIONS[t] || TRADITIONS.solitario).color;
}

export function tradLabel(t: string): string {
  return (TRADITIONS[t] || TRADITIONS.solitario).label;
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  return `há ${Math.floor(hours / 24)}d`;
}
