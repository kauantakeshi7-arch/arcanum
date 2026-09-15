import type { LeaderboardEntry, QuizQuestion, TrilhaModule } from '../../types/trilhas';

// Porte literal de index.html:1579-1610 — dados fixos no cliente (módulos,
// perguntas de quiz e ranking), como no app original. Nada disso vem do
// Supabase; só a conclusão de módulos concede Mana real (profile.mana_xp).
// m1/m2 já nascem "concluídos" no app original (progresso de exemplo) — sem
// conceder Mana, só para a árvore não começar totalmente vazia. Preservado
// aqui tal como está, não é um bug.
export const TRILHA_MODULES: TrilhaModule[] = [
  { id: 'm1', title: 'História & Fundamentos', sub: 'Origens das tradições místicas', xp: 15, initiallyDone: true },
  { id: 'm2', title: 'Ervas & Banhos', sub: 'Simbolismo das plantas sagradas', xp: 15, initiallyDone: true },
  { id: 'm3', title: 'Tarot & Simbologia', sub: 'Os 78 arcanos e seus significados', xp: 20, initiallyDone: false },
  { id: 'm4', title: 'Astrologia', sub: 'Casas, planetas e trânsitos', xp: 20, initiallyDone: false },
  { id: 'm5', title: 'Cabala', sub: 'A Árvore da Vida', xp: 25, initiallyDone: false },
  { id: 'm6', title: 'Pontos Riscados & Sigilos', sub: 'Símbolos de ativação e intenção', xp: 25, initiallyDone: false },
];
export const QUIZZES: Record<string, QuizQuestion[]> = {
  m1: [
    {
      q: 'Qual tradição nasceu no Brasil, sincretizando cultos africanos, indígenas e católicos?',
      opts: ['Umbanda', 'Hermetismo', 'Thelema', 'Xamanismo nórdico'],
      correct: 0,
    },
    {
      q: 'Aleister Crowley é figura central de qual sistema?',
      opts: ['Espiritismo', 'Thelema', 'Candomblé', 'Wicca tradicional'],
      correct: 1,
    },
    {
      q: '"Grimório" refere-se tradicionalmente a:',
      opts: ['Um tipo de vela', 'Uma dança ritual', 'Um livro de anotações e feitiços pessoais', 'Um instrumento musical'],
      correct: 2,
    },
  ],
  m2: [
    {
      q: 'Banhos de ervas na cultura popular estão associados à:',
      opts: ['Limpeza espiritual e energética', 'Cura garantida de doenças', 'Culinária afro-brasileira', 'Nenhuma das anteriores'],
      correct: 0,
    },
    {
      q: 'Qual planta é associada à proteção em diversas tradições populares?',
      opts: ['Alface', 'Arruda', 'Cenoura', 'Milho'],
      correct: 1,
    },
    {
      q: '"Defumação" é a prática de:',
      opts: ['Colher plantas à noite', 'Plantar em lua cheia', 'Queimar ervas/resinas para limpar ambientes', 'Secar flores para chá'],
      correct: 2,
    },
  ],
  m3: [
    { q: 'Quantas cartas tem um baralho de Tarot tradicional?', opts: ['52', '64', '78', '100'], correct: 2 },
    {
      q: 'O Arcano "A Torre" costuma simbolizar:',
      opts: ['Ruptura e mudança repentina', 'Prosperidade estável', 'Um novo amor', 'Viagem tranquila'],
      correct: 0,
    },
    { q: 'Os Arcanos Maiores somam quantas cartas?', opts: ['14', '22', '40', '56'], correct: 1 },
  ],
  m4: [
    {
      q: 'O Ascendente no mapa astral representa:',
      opts: ['Sua vida amorosa', 'Sua carreira', 'Como você se apresenta ao mundo', 'Seu signo solar'],
      correct: 2,
    },
    { q: 'Quantos signos existem no zodíaco ocidental?', opts: ['9', '10', '12', '13'], correct: 2 },
    {
      q: 'Mercúrio retrógrado é popularmente associado a:',
      opts: ['Falhas de comunicação e imprevistos', 'Sorte no amor', 'Energia física extra', 'Sorte financeira'],
      correct: 0,
    },
  ],
  m5: [
    { q: 'A Árvore da Vida cabalística tem quantas Sefirot?', opts: ['7', '10', '12', '22'], correct: 1 },
    {
      q: '"Kether" representa:',
      opts: ['A Coroa, ponto mais elevado', 'O mundo material', 'A lua', 'O caos primordial'],
      correct: 0,
    },
    {
      q: 'A Cabala tem raízes históricas em qual tradição?',
      opts: ['Misticismo judaico', 'Xintoísmo', 'Vodu haitiano', 'Zoroastrismo'],
      correct: 0,
    },
  ],
  m6: [
    {
      q: 'Um sigilo mágico é geralmente criado a partir de:',
      opts: ['Um número de sorte', 'Uma intenção transformada em símbolo', 'Uma data de nascimento', 'Uma cor favorita'],
      correct: 1,
    },
    {
      q: '"Pontos riscados" são associados a qual prática?',
      opts: ['Tarot europeu', 'Umbanda e Quimbanda', 'Alquimia medieval', 'Feng Shui'],
      correct: 1,
    },
    {
      q: 'Após criar um sigilo, uma prática comum é:',
      opts: ['Publicá-lo imediatamente', 'Vendê-lo a terceiros', '"Carregá-lo" com foco e depois soltar a intenção', 'Destruí-lo sem nunca usar'],
      correct: 2,
    },
  ],
};

export const LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Marcus Aurum', mana: 940 },
  { name: 'Yara Ventos', mana: 875 },
  { name: 'Cinza Rubra', mana: 760 },
  { name: 'Théo Cinzas', mana: 610 },
];
