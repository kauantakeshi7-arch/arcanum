// Porte literal de index.html:3091-3119 (grau/familiar/loja) e 3938-3948
// (badges). Nenhum valor muda — só ganha tipos.
export function gradeOf(mana: number): number {
  return Math.min(7, 1 + Math.floor(mana / 120));
}

export function familiarStage(mana: number): number {
  if (mana < 50) return 0;
  if (mana < 200) return 1;
  if (mana < 450) return 2;
  return 3;
}

export function robeColorForGrade(g: number): string {
  return ['#3a3450', '#4b4166', '#5a4a7a', '#6f4f8f', '#8B6CF2', '#c9a24b', '#e8c989'][g - 1] || '#8B6CF2';
}

export interface ShopItemDef {
  id: string;
  label: string;
  cost: number;
  color?: string;
  glyph?: string;
}

export type ShopCategory = 'aura' | 'robe' | 'item';

export const SHOP_ITEMS: Record<ShopCategory, ShopItemDef[]> = {
  aura: [
    { id: 'default', label: 'Aura da Tradição', cost: 0 },
    { id: 'emerald', label: 'Aura Esmeralda', cost: 120, color: '#34C79A' },
    { id: 'violet', label: 'Aura Violeta Arcana', cost: 120, color: '#8B6CF2' },
    { id: 'gold', label: 'Aura Dourada Radiante', cost: 250, color: '#D4A853' },
  ],
  robe: [
    { id: 'default', label: 'Manto do Grau', cost: 0 },
    { id: 'crimson', label: 'Manto Carmesim', cost: 150, color: '#C1614A' },
    { id: 'midnight', label: 'Manto Meia-Noite', cost: 150, color: '#3B4066' },
    { id: 'ivory', label: 'Manto Marfim Sagrado', cost: 300, color: '#EDEAE3' },
  ],
  item: [
    { id: 'default', label: 'Vela Simples', cost: 0, glyph: '🕯️' },
    { id: 'crystal', label: 'Cristal de Quartzo', cost: 100, glyph: '🔮' },
    { id: 'grimoire', label: 'Grimório Flutuante', cost: 150, glyph: '📖' },
    { id: 'chalice', label: 'Taça Ritual', cost: 200, glyph: '🏆' },
  ],
};

export const SHOP_CATEGORY_LABELS: Record<ShopCategory, string> = {
  aura: 'Auras Elementais',
  robe: 'Mantos',
  item: 'Itens do Altar',
};

export function shopItem(cat: ShopCategory, id: string): ShopItemDef {
  return SHOP_ITEMS[cat].find((i) => i.id === id) || SHOP_ITEMS[cat][0];
}

export const DEFAULT_AVATAR_LAYERS = { aura: 'default', robe: 'default', item: 'default' };
export const DEFAULT_UNLOCKED_ITEMS = ['aura:default', 'robe:default', 'item:default'];

export interface BadgeStats {
  mana_xp: number;
  streak_days: number;
  covensFounded: number;
  gratitudeCount: number;
  lunarCompletions: number;
  candleLights: number;
}

export interface BadgeDef {
  id: string;
  label: string;
  icon: string;
  hint: string;
  test: (s: BadgeStats) => boolean;
}

export const BADGE_DEFS: BadgeDef[] = [
  { id: 'buscador', label: 'Buscador Dedicado', icon: '✦', hint: 'Alcance 120 Mana', test: (s) => s.mana_xp >= 120 },
  { id: 'adepto', label: 'Adepto do Caminho', icon: '🔥', hint: 'Alcance 480 Mana', test: (s) => s.mana_xp >= 480 },
  { id: 'chama7', label: 'Guardião da Chama', icon: '🕯️', hint: '7 dias de Chama Sagrada', test: (s) => s.streak_days >= 7 },
  { id: 'chama30', label: 'Chama Eterna', icon: '🌟', hint: '30 dias de Chama Sagrada', test: (s) => s.streak_days >= 30 },
  { id: 'fundador', label: 'Fundador de Coven', icon: '🏛️', hint: 'Funde um Coven', test: (s) => s.covensFounded >= 1 },
  {
    id: 'lunar',
    label: 'Andarilho Lunar',
    icon: '🌙',
    hint: 'Complete as 4 missões do Passe Lunar',
    test: (s) => s.lunarCompletions >= 4,
  },
  { id: 'gratidao', label: 'Voz de Gratidão', icon: '🙏', hint: 'Registre uma Graça Alcançada', test: (s) => s.gratitudeCount >= 1 },
  {
    id: 'chamas5',
    label: 'Chama Compartilhada',
    icon: '💫',
    hint: 'Acenda 5 velas no Mural de Firmezas',
    test: (s) => s.candleLights >= 5,
  },
];

export function computeBadges(stats: BadgeStats) {
  return BADGE_DEFS.map((b) => ({ ...b, achieved: b.test(stats) }));
}
