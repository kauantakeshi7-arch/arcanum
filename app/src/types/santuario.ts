export interface GrimoireEntryViewModel {
  id: string;
  type: string;
  title: string;
  content: string;
  date: string;
}

export interface AlchemyRecipe {
  label: string;
  herbs: string[];
  moon: string;
  day: string;
  planet: string;
  candle: string;
}

export interface GlossaryEntry {
  term: string;
  category: string;
  description: string;
}

export interface OracleCard {
  name: string;
  meaning: string;
}
