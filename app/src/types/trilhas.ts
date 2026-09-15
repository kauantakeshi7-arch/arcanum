import type { MoonPhase } from '../lib/moon';

export interface LunarQuestViewModel {
  id: string;
  title: string;
  description: string;
  phase: MoonPhase;
  mana: number;
  done: boolean;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  correct: number;
}

export interface TrilhaModule {
  id: string;
  title: string;
  sub: string;
  xp: number;
  initiallyDone: boolean;
}

export interface LeaderboardEntry {
  name: string;
  mana: number;
}
