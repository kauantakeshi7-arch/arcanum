import type { AlchemyRecipe, GlossaryEntry, OracleCard } from '../../types/santuario';

// Porte literal de index.html:2552-2559 (ALCHEMY_RECIPES) — receitas fixas,
// sem tabela no banco.
export const ALCHEMY_RECIPES: Record<string, AlchemyRecipe> = {
  caminhos: { label: 'Abertura de Caminhos', herbs: ['Alecrim', 'Guiné', 'Arruda'], moon: 'Lua Crescente', day: 'Segunda-feira', planet: 'Mercúrio', candle: 'Amarela ou Dourada' },
  protecao: { label: 'Proteção / Descarrego', herbs: ['Arruda', 'Guiné', 'Comigo-Ninguém-Pode'], moon: 'Lua Minguante', day: 'Sábado', planet: 'Saturno', candle: 'Preta ou Branca' },
  prosperidade: { label: 'Prosperidade', herbs: ['Canela', 'Manjericão', 'Louro'], moon: 'Lua Crescente', day: 'Quinta-feira', planet: 'Júpiter', candle: 'Verde ou Dourada' },
  harmonia: { label: 'Harmonização / Paz no Lar', herbs: ['Lavanda', 'Camomila', 'Alfazema'], moon: 'Lua Cheia', day: 'Sexta-feira', planet: 'Vênus', candle: 'Rosa ou Branca' },
  amor: { label: 'Amor / Relacionamentos', herbs: ['Rosa', 'Canela', 'Cravo'], moon: 'Lua Cheia', day: 'Sexta-feira', planet: 'Vênus', candle: 'Vermelha ou Rosa' },
  cura: { label: 'Cura / Saúde', herbs: ['Eucalipto', 'Hortelã', 'Alecrim'], moon: 'Lua Nova', day: 'Domingo', planet: 'Sol', candle: 'Branca ou Laranja' },
};

// Porte literal de index.html:2509-2540 (GLOSSARY_CATEGORIES/MAGIC_GLOSSARY).
export const GLOSSARY_CATEGORIES: Record<string, string> = {
  erva: '🌿 Erva',
  cristal: '🔮 Cristal',
  orixa: '✦ Orixá/Guia',
  planeta: '🪐 Planeta/Dia',
};

export const MAGIC_GLOSSARY: GlossaryEntry[] = [
  { term: 'Arruda', category: 'erva', description: 'Proteção e descarrego. Usada em banhos e defumações contra olho gordo e energias pesadas.' },
  { term: 'Alecrim', category: 'erva', description: 'Abertura de caminhos, clareza mental e prosperidade. Associado ao Sol e a Mercúrio.' },
  { term: 'Guiné', category: 'erva', description: 'Proteção forte contra magias e invejas. Tradicionalmente plantada à porta de casa.' },
  { term: 'Espada de São Jorge', category: 'erva', description: 'Corte de demandas e proteção da casa; associada a Ogum e à firmeza guerreira.' },
  { term: 'Losna', category: 'erva', description: 'Limpeza espiritual profunda e clarividência; usada em banhos de descarrego.' },
  { term: 'Manjericão', category: 'erva', description: 'Prosperidade, harmonia doméstica e atração de bons fluidos.' },
  { term: 'Pau-santo', category: 'erva', description: 'Defumação de limpeza e elevação espiritual, muito usada em rituais contemporâneos.' },
  { term: 'Alfazema/Lavanda', category: 'erva', description: 'Paz, sono tranquilo e harmonização emocional.' },
  { term: 'Quartzo Transparente', category: 'cristal', description: 'Amplificador universal de energia e intenção; "o cristal-mestre".' },
  { term: 'Ametista', category: 'cristal', description: 'Espiritualidade, intuição e proteção psíquica; ajuda na meditação.' },
  { term: 'Turmalina Negra', category: 'cristal', description: 'Proteção e aterramento; absorve energias densas e negativas.' },
  { term: 'Citrino', category: 'cristal', description: 'Prosperidade, abundância e vitalidade; raramente precisa de limpeza energética.' },
  { term: 'Pirita', category: 'cristal', description: 'Prosperidade material e proteção; conhecida como "ouro dos tolos" pela cor dourada.' },
  { term: 'Quartzo Rosa', category: 'cristal', description: 'Amor próprio, cura emocional e relações harmoniosas.' },
  { term: 'Obsidiana', category: 'cristal', description: 'Proteção intensa e corte de laços energéticos negativos.' },
  { term: 'Oxóssi', category: 'orixa', description: 'Orixá da caça e da mata, regente da abundância, da fartura e do conhecimento. Cor: verde.' },
  { term: 'Ogum', category: 'orixa', description: 'Orixá guerreiro, senhor dos caminhos e do ferro; associado à coragem e à conquista. Cor: azul ou vermelho.' },
  { term: 'Iemanjá', category: 'orixa', description: 'Rainha do mar, mãe de todos os Orixás; associada à maternidade e à intuição. Cor: azul claro/branco.' },
  { term: 'Oxum', category: 'orixa', description: 'Orixá das águas doces, do amor, da beleza e da prosperidade. Cor: dourado/amarelo.' },
  { term: 'Xangô', category: 'orixa', description: 'Orixá da justiça, do trovão e da lei; pune injustiças com o machado duplo (oxé). Cor: marrom/branco.' },
  { term: 'Exu', category: 'orixa', description: 'Guardião dos caminhos e das encruzilhadas; mensageiro entre os planos. Sem ele, nenhum trabalho se completa.' },
  { term: 'Pombagira', category: 'orixa', description: 'Entidade feminina da Quimbanda, senhora do amor, da sedução e da liberdade feminina.' },
  { term: 'Domingo — Sol', category: 'planeta', description: 'Vitalidade, sucesso e clareza. Bom para rituais de conquista e autoestima.' },
  { term: 'Segunda — Lua', category: 'planeta', description: 'Intuição, emoções e o lar. Ideal para rituais de introspecção e sonhos.' },
  { term: 'Terça — Marte', category: 'planeta', description: 'Coragem, ação e proteção. Favorece rompimentos de demanda e coragem para agir.' },
  { term: 'Quarta — Mercúrio', category: 'planeta', description: 'Comunicação, comércio e viagens. Bom para negociações e abertura de caminhos.' },
  { term: 'Quinta — Júpiter', category: 'planeta', description: 'Expansão, sorte e prosperidade. Favorece rituais de crescimento financeiro.' },
  { term: 'Sexta — Vênus', category: 'planeta', description: 'Amor, beleza e harmonia. Ideal para trabalhos afetivos e de autoestima.' },
  { term: 'Sábado — Saturno', category: 'planeta', description: 'Encerramentos, limites e disciplina. Bom para banimentos e cortes de ciclo.' },
];

// Porte literal de index.html:2682-2691 (ORACLE_POOL).
export const ORACLE_POOL: OracleCard[] = [
  { name: 'A Estrela', meaning: 'Esperança renovada e confiança de que o pior já passou.' },
  { name: 'O Sol', meaning: 'Clareza, vitalidade e um período de alegria simples.' },
  { name: 'A Lua', meaning: 'Intuição em alta, mas cuidado com ilusões e meios-tons.' },
  { name: 'A Roda da Fortuna', meaning: 'Ciclos mudando — o que sobe também pode descer, e vice-versa.' },
  { name: 'O Mago', meaning: 'Você já tem as ferramentas necessárias; falta dar o primeiro passo.' },
  { name: 'A Imperatriz', meaning: 'Fertilidade, criação e abundância em gestação.' },
  { name: 'Força', meaning: 'Coragem serena — domar com gentileza, não com violência.' },
  { name: 'O Eremita', meaning: 'Momento de recolhimento para escutar sua própria voz.' },
];

// Porte de index.html:2361 (CANDLE_COLORS).
export const CANDLE_COLORS: Record<string, string> = {
  gold: '#D4A853',
  violet: '#8B6CF2',
  emerald: '#34C79A',
  white: '#EDEAE3',
};
