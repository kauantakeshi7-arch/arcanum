import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { shortDate } from '../lib/constants';
import { useSession } from './SessionContext';
import type { CandleViewModel, GratitudeViewModel } from '../types/egregora';

interface EgregoraDataContextValue {
  loading: boolean;
  candles: CandleViewModel[];
  gratitude: GratitudeViewModel[];
  lightCandle: (candleId: string) => Promise<void>;
  addCandle: (intention: string) => Promise<void>;
  sendFlower: (testimonialId: string) => Promise<void>;
  addGratitude: (guideName: string, testimony: string) => Promise<void>;
}

const EgregoraDataContext = createContext<EgregoraDataContextValue | null>(null);

export function EgregoraDataProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useSession();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [candles, setCandles] = useState<CandleViewModel[]>([]);
  const [gratitude, setGratitude] = useState<GratitudeViewModel[]>([]);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    Promise.all([
      api.fetchCandles(),
      api.fetchMyLitCandleIds(userId),
      api.fetchGratitude(),
      api.fetchMyFlowerIds(userId),
    ])
      .then(([candleRows, myLights, gratRows, myFlowers]) => {
        if (!active) return;
        setCandles(
          (candleRows as unknown as Array<{ id: string; user_id: string; intention: string; lights_count: number; profiles?: { display_name: string } }>).map(
            (r) => ({
              id: r.id,
              userId: r.user_id,
              by: r.profiles?.display_name || 'Alguém',
              intention: r.intention,
              lights: r.lights_count,
              lit: myLights.has(r.id),
            }),
          ),
        );
        setGratitude(
          (gratRows as unknown as Array<{ id: string; user_id: string; author_name: string | null; guide_name: string; testimony: string; flowers_count: number; created_at: string }>).map(
            (r) => ({
              id: r.id,
              userId: r.user_id,
              by: r.author_name || 'Alguém',
              guideName: r.guide_name,
              testimony: r.testimony,
              flowers: r.flowers_count,
              sent: myFlowers.has(r.id),
              date: shortDate(r.created_at),
            }),
          ),
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error('Falha ao carregar a Egrégora:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  // Porte de index.html:3573-3587 (light-candle) — otimista, com rollback se falhar.
  const lightCandle = useCallback(
    async (candleId: string) => {
      if (!userId) return;
      const candle = candles.find((c) => c.id === candleId);
      if (!candle || candle.lit) return;
      setCandles((prev) => prev.map((c) => (c.id === candleId ? { ...c, lit: true, lights: c.lights + 1 } : c)));
      try {
        await api.firmCandleLight(candleId, userId);
        if (candle.userId) api.createNotification(candle.userId, userId, 'candle_light', candleId).catch(console.error);
      } catch (err) {
        console.error(err);
        setCandles((prev) => prev.map((c) => (c.id === candleId ? { ...c, lit: false, lights: c.lights - 1 } : c)));
        throw err;
      }
    },
    [userId, candles],
  );

  const addCandle = useCallback(
    async (intention: string) => {
      if (!userId || !profile) return;
      const row = await api.lightNewCandle(userId, intention);
      setCandles((prev) => [{ id: row.id, userId, by: profile.display_name, intention, lights: 0, lit: false }, ...prev]);
    },
    [userId, profile],
  );

  // Porte de index.html:3628-3641 (send-flower) — mesmo padrão otimista.
  const sendFlower = useCallback(
    async (testimonialId: string) => {
      if (!userId) return;
      const entry = gratitude.find((g) => g.id === testimonialId);
      if (!entry || entry.sent) return;
      setGratitude((prev) => prev.map((g) => (g.id === testimonialId ? { ...g, sent: true, flowers: g.flowers + 1 } : g)));
      try {
        await api.sendFlower(testimonialId, userId);
        if (entry.userId) api.createNotification(entry.userId, userId, 'connection', testimonialId).catch(console.error);
      } catch (err) {
        console.error(err);
        setGratitude((prev) => prev.map((g) => (g.id === testimonialId ? { ...g, sent: false, flowers: g.flowers - 1 } : g)));
        throw err;
      }
    },
    [userId, gratitude],
  );

  const addGratitude = useCallback(
    async (guideName: string, testimony: string) => {
      if (!userId || !profile) return;
      const row = await api.postGratitude(userId, guideName, testimony);
      setGratitude((prev) => [
        { id: row.id, userId, by: profile.display_name, guideName, testimony, flowers: 0, sent: false, date: 'hoje' },
        ...prev,
      ]);
    },
    [userId, profile],
  );

  return (
    <EgregoraDataContext.Provider
      value={{ loading, candles, gratitude, lightCandle, addCandle, sendFlower, addGratitude }}
    >
      {children}
    </EgregoraDataContext.Provider>
  );
}

export function useEgregoraData() {
  const ctx = useContext(EgregoraDataContext);
  if (!ctx) throw new Error('useEgregoraData precisa estar dentro de <EgregoraDataProvider>');
  return ctx;
}
