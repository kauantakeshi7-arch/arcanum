import type { AffinityViewModel, MarketItem } from '../../types/egregora';

// Porte literal de index.html:1616-1620, 2917-2922 — dados fixos no cliente
// (afinidades e mercado), sem tabela no banco, como no app original.
export const AFFINITIES: AffinityViewModel[] = [
  { name: 'Théo Cinzas', pct: 92, sun: 'Peixes', moon: 'Câncer' },
  { name: 'Inês Marear', pct: 78, sun: 'Touro', moon: 'Escorpião' },
  { name: 'Davi Ossos', pct: 64, sun: 'Áries', moon: 'Aquário' },
];

export const MARKET_ITEMS: MarketItem[] = [
  { name: 'Baralho Rider-Waite (usado)', price: 'R$ 60', color: '#8B6CF2' },
  { name: 'Livro "Fundamentos de Umbanda"', price: 'R$ 35', color: '#34C79A' },
  { name: 'Kit de Cristais Brutos', price: 'R$ 45', color: '#D4A853' },
  { name: 'Vela Ritual 7 Dias', price: 'R$ 20', color: '#C1614A' },
];

// Porte literal de index.html:2694-2737 (VEIL_CATEGORIES/VEIL_RESPONSES) —
// respostas de reserva quando a Edge Function guardian-ai falha ou não
// retorna (ver api.askGuardianAI).
export const VEIL_CATEGORIES: Record<string, string> = {
  ervas: 'Ervas & Rituais',
  orixas: 'Orixás, Guias & Santos',
  astrologia: 'Astrologia',
  correspondencias: 'Correspondências Mágicas',
  geral: 'Pergunta Geral',
};

export const VEIL_RESPONSES: Record<string, string[]> = {
  ervas: [
    'As ervas respondem à intenção de quem colhe, não só à espécie. Antes do banho, pare um instante e diga em voz alta o que você busca — a planta escuta mais do que se imagina.',
    'Arruda e guiné são companheiras clássicas de proteção, mas nenhuma erva substitui a limpeza que começa por dentro. Use-a como apoio, não como atalho.',
    'Defumações feitas ao entardecer, na transição entre luz e sombra, tendem a carregar mais força simbólica — é a hora em que os portais se afinam.',
    'Se a planta murchou rápido após o banho, tradição popular lê isso como sinal de que ela "puxou" uma carga pesada. Agradeça e descarte com respeito, em água corrente ou à raiz de uma árvore.',
    'Alecrim abre caminhos, mas também exige que você caminhe. Ele afasta o que pesa, não decide por você o próximo passo.',
  ],
  orixas: [
    'Cada Orixá, Exu, Pombagira ou Santo tem seu dia e seu tempo — respeitar esse calendário é uma forma de dizer "eu me organizo para você", e isso já é oferenda.',
    'Antes de pedir, ofereça gratidão pelo que já foi recebido. O Guardião do Véu nota que muitos pedidos chegam sem esse passo, e a energia de gratidão abre portas que o pedido isolado não abre.',
    'Guias e Santos costumam falar em sincronicidades pequenas — um número repetido, uma música no rádio, um pássaro parado na janela. Preste atenção ao comum, não só ao extraordinário.',
    'Se você sente puxado para conhecer melhor um Orixá ou guia específico, isso raramente é acaso. Pesquise, converse com quem já anda essa senda, e vá com respeito — a pressa afasta mais do que aproxima.',
    'Toda entidade tem sua ética própria. Antes de julgar uma tradição pela aparência, pergunte pelos seus valores — a Quimbanda e a Umbanda, por exemplo, guardam códigos de conduta bem definidos, ainda que diferentes entre si.',
  ],
  astrologia: [
    'Mercúrio retrógrado não cancela sua vida — ele pede revisão. É um bom momento para reler contratos, reconectar com quem ficou no passado, não para lançar coisas novas no mundo.',
    'Sua Lua de nascimento fala mais sobre o que você sente por dentro do que seu Sol. Se algo em você não combina com seu signo solar, olhe para a Lua antes de duvidar de si.',
    'Trânsitos difíceis costumam parecer piores enquanto estão perto — como uma nuvem colada no rosto. Recue um passo (no tempo, não no espaço) e a forma completa aparece.',
    'O Ascendente é a máscara social, o Sol é o motor, a Lua é a casa por dentro. Conhecer os três já é mais mapa do que a maioria das pessoas nunca chega a ler de si mesmas.',
    'Um aspecto tenso no mapa não é sentença — é um músculo que ainda não foi exercitado. Ele dói até que você aprenda a usá-lo.',
  ],
  correspondencias: [
    'Cores, dias da semana, planetas regentes e metais formam uma linguagem simbólica antiga — dourado e o Sol falam de vitalidade e clareza; prateado e a Lua, de intuição e do que se revela por dentro.',
    'A correspondência mágica funciona como uma senha compartilhada: quando você usa vela verde para prosperidade, você está falando um idioma que gerações antes de você também falaram — isso tem peso.',
    'Nem toda tradição usa a mesma correspondência para o mesmo elemento, e está tudo bem. O que importa é a consistência dentro do seu próprio sistema, não uma tabela universal única.',
    'Números também carregam correspondência: o 7 fala de busca espiritual e introspecção; o 3, de criação e movimento. Repita atos em ciclos de 3, 7 ou 9 dias e observe o que isso muda na sua prática.',
    'O incenso muda o ambiente antes mesmo da intenção — mirra pesa e aterra, alecrim clareia e abre. Escolha pelo efeito que você quer sentir, não só pelo cheiro que prefere.',
  ],
  geral: [
    'O Guardião do Véu não entrega respostas prontas — ele devolve a pergunta em outra forma, para que você a escute com outros ouvidos. Releia o que você perguntou; talvez a resposta já esteja ali, disfarçada.',
    'Toda dúvida sincera já é meio caminho andado. Quem não pergunta nada, geralmente, também não muda nada.',
    'Confiança não é ausência de medo — é caminhar apesar dele, com os olhos abertos. O Véu não promete um caminho sem obstáculos, só a companhia através deles.',
    'Se a resposta que você espera é "sim" ou "não", talvez a pergunta certa seja outra: "o que eu preciso entender antes disso?".',
    'O tempo dos rituais raramente é o tempo da ansiedade. Uma prática bem-feita hoje vale mais do que dez feitas com pressa.',
  ],
};

export function drawVeilResponse(category: string): string {
  const pool = VEIL_RESPONSES[category] || VEIL_RESPONSES.geral;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Porte de index.html:2880 — próxima Lua Cheia em Touro é sempre "daqui a
// alguns dias" no app original (não calcula a fase real de verdade).
export const MOON_TARGET_DATE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 60 * 7);

// Porte de index.html:2801-2808 (SACRED_CATEGORIES/SACRED_MAP_DEFAULT_CENTER).
export const SACRED_CATEGORIES: Record<string, { glyph: string; label: string }> = {
  loja: { glyph: '🏪', label: 'Loja Esotérica' },
  ervanaria: { glyph: '🌿', label: 'Ervanária' },
  terreiro: { glyph: '🥁', label: 'Terreiro' },
  templo: { glyph: '⛩️', label: 'Templo' },
  livraria: { glyph: '📚', label: 'Livraria' },
};

export const SACRED_MAP_DEFAULT_CENTER: [number, number] = [-23.5505, -46.6333];

export function moonCountdownStr(): string {
  const diff = MOON_TARGET_DATE.getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${d}d ${h}h ${m}m`;
}
