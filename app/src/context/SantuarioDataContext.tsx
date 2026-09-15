import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { updateProfile } from '../lib/auth';
import { shortDate } from '../lib/constants';
import { useSession } from './SessionContext';
import type { GrimoireEntryViewModel } from '../types/santuario';

interface SantuarioDataContextValue {
  loading: boolean;
  grimoire: GrimoireEntryViewModel[];
  addGrimoireEntry: (type: string, title: string, content: string) => Promise<{ streakKept: boolean; streakDays: number }>;
}

const SantuarioDataContext = createContext<SantuarioDataContextValue | null>(null);

export function SantuarioDataProvider({ children }: { children: ReactNode }) {
  const { session, profile, patchProfileLocal } = useSession();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [grimoire, setGrimoire] = useState<GrimoireEntryViewModel[]>([]);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    api
      .fetchGrimoire(userId)
      .then((rows) => {
        if (!active) return;
        setGrimoire(
          (rows as unknown as Array<{ id: string; entry_type: string; title: string; content: string; created_at: string }>).map(
            (r) => ({ id: r.id, type: r.entry_type, title: r.title, content: r.content, date: shortDate(r.created_at) }),
          ),
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Falha ao carregar o grimório:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  // Porte de index.html:4427-4455 (btnSaveGrim). A Chama Sagrada só sobe uma
  // vez por dia — logged_today_at guarda a última data em que isso aconteceu.
  const addGrimoireEntry = useCallback(
    async (type: string, title: string, content: string): Promise<{ streakKept: boolean; streakDays: number }> => {
      if (!userId || !profile) return { streakKept: false, streakDays: 0 };
      const row = await api.addGrimoireEntry(userId, { entry_type: type, title, content });
      setGrimoire((prev) => [{ id: row.id, type, title, content, date: 'hoje' }, ...prev]);

      const today = new Date().toISOString().slice(0, 10);
      const isFirstToday = profile.logged_today_at !== today;
      const streakDays = isFirstToday ? profile.streak_days + 1 : profile.streak_days;
      if (isFirstToday) {
        patchProfileLocal({ streak_days: streakDays, logged_today_at: today });
        updateProfile(userId, { streak_days: streakDays, logged_today_at: today }).catch(console.error);
      }
      return { streakKept: isFirstToday, streakDays };
    },
    [userId, profile, patchProfileLocal],
  );

  return (
    <SantuarioDataContext.Provider value={{ loading, grimoire, addGrimoireEntry }}>
      {children}
    </SantuarioDataContext.Provider>
  );
}

export function useSantuarioData() {
  const ctx = useContext(SantuarioDataContext);
  if (!ctx) throw new Error('useSantuarioData precisa estar dentro de <SantuarioDataProvider>');
  return ctx;
}
