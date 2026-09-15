import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { updateProfile } from '../lib/auth';
import { useSession } from './SessionContext';
import { TRILHA_MODULES } from '../features/trilhas/trilhasData';
import type { LunarQuestViewModel } from '../types/trilhas';
import type { MoonPhase } from '../lib/moon';

interface TrilhasDataContextValue {
  loading: boolean;
  lunarQuests: LunarQuestViewModel[];
  moduleDoneIds: Set<string>;
  completeLunarQuest: (questId: string, proofPhotoUrl: string, sharedToFeed: boolean) => Promise<void>;
  completeModule: (moduleId: string, earnedMana: number) => void;
}

const TrilhasDataContext = createContext<TrilhasDataContextValue | null>(null);

export function TrilhasDataProvider({ children }: { children: ReactNode }) {
  const { session, profile, adjustManaXp } = useSession();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [lunarQuests, setLunarQuests] = useState<LunarQuestViewModel[]>([]);
  const [moduleDoneIds, setModuleDoneIds] = useState<Set<string>>(
    () => new Set(TRILHA_MODULES.filter((m) => m.initiallyDone).map((m) => m.id)),
  );

  useEffect(() => {
    if (!userId) return;
    let active = true;

    Promise.all([api.fetchLunarQuests(), api.fetchMyQuestCompletions(userId)])
      .then(([rows, completedIds]) => {
        if (!active) return;
        setLunarQuests(
          (rows as unknown as Array<{ id: string; title: string; description: string; required_moon_phase: MoonPhase; mana_reward: number }>).map(
            (r) => ({
              id: r.id,
              title: r.title,
              description: r.description,
              phase: r.required_moon_phase,
              mana: r.mana_reward,
              done: completedIds.has(r.id),
            }),
          ),
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Falha ao carregar o Passe Lunar:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const completeLunarQuest = useCallback(
    async (questId: string, proofPhotoUrl: string, sharedToFeed: boolean) => {
      if (!userId || !profile) return;
      const quest = lunarQuests.find((q) => q.id === questId);
      if (!quest) return;
      await api.completeLunarQuest(questId, userId, proofPhotoUrl, sharedToFeed);
      await updateProfile(userId, { mana_xp: profile.mana_xp + quest.mana });
      adjustManaXp(quest.mana);
      setLunarQuests((prev) => prev.map((q) => (q.id === questId ? { ...q, done: true } : q)));
    },
    [userId, profile, lunarQuests, adjustManaXp],
  );

  const completeModule = useCallback(
    (moduleId: string, earnedMana: number) => {
      setModuleDoneIds((prev) => new Set(prev).add(moduleId));
      adjustManaXp(earnedMana);
      if (userId && profile) {
        updateProfile(userId, { mana_xp: profile.mana_xp + earnedMana }).catch(console.error);
      }
    },
    [userId, profile, adjustManaXp],
  );

  return (
    <TrilhasDataContext.Provider
      value={{ loading, lunarQuests, moduleDoneIds, completeLunarQuest, completeModule }}
    >
      {children}
    </TrilhasDataContext.Provider>
  );
}

export function useTrilhasData() {
  const ctx = useContext(TrilhasDataContext);
  if (!ctx) throw new Error('useTrilhasData precisa estar dentro de <TrilhasDataProvider>');
  return ctx;
}
