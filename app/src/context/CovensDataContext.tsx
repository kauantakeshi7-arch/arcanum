import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import type { CreateCovenParams } from '../lib/api';
import { useSession } from './SessionContext';
import type { CovenListItem } from '../types/covens';

interface CovensDataContextValue {
  loading: boolean;
  covens: CovenListItem[];
  toggleMembership: (covenId: string) => Promise<void>;
  createCoven: (params: Omit<CreateCovenParams, 'createdBy'>) => Promise<CovenListItem>;
  updateCoven: (
    covenId: string,
    patch: { name: string; description: string | null; privacy: string; pinned_announcement: string | null },
  ) => Promise<void>;
  adjustMemberCount: (covenId: string, delta: number) => void;
}

const CovensDataContext = createContext<CovensDataContextValue | null>(null);

export function CovensDataProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [covens, setCovens] = useState<CovenListItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    let active = true;

    async function load() {
      setLoading(true);
      const [rows, myCovenIds] = await Promise.all([api.fetchCovens(), api.fetchMyCovenIds(userId!)]);
      if (!active) return;
      setCovens(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          tradition: row.tradition,
          description: row.description,
          privacy: row.privacy,
          memberCount: row.member_count,
          createdBy: row.created_by,
          pinnedAnnouncement: row.pinned_announcement,
          joined: myCovenIds.has(row.id),
        })),
      );
      setLoading(false);
    }

    load().catch((err) => {
      console.error('Falha ao carregar covens:', err);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [userId]);

  const toggleMembership = useCallback(
    async (covenId: string) => {
      if (!userId) return;
      let wasJoined = false;
      let createdBy: string | null = null;
      let name = '';
      setCovens((prev) =>
        prev.map((c) => {
          if (c.id !== covenId) return c;
          wasJoined = c.joined;
          createdBy = c.createdBy;
          name = c.name;
          return { ...c, joined: !c.joined, memberCount: c.memberCount + (c.joined ? -1 : 1) };
        }),
      );
      try {
        if (!wasJoined) {
          await api.joinCoven(covenId, userId);
          if (createdBy) api.createNotification(createdBy, userId, 'coven_join', covenId).catch(console.error);
        } else {
          await api.leaveCoven(covenId, userId);
        }
      } catch (err) {
        console.error(err);
        setCovens((prev) =>
          prev.map((c) =>
            c.id === covenId ? { ...c, joined: wasJoined, memberCount: c.memberCount + (wasJoined ? 1 : -1) } : c,
          ),
        );
        throw err;
      }
      void name;
    },
    [userId],
  );

  const createCoven = useCallback(
    async (params: Omit<CreateCovenParams, 'createdBy'>): Promise<CovenListItem> => {
      if (!userId) throw new Error('Sem sessão ativa.');
      const row = await api.createCoven({ ...params, createdBy: userId });
      const item: CovenListItem = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        tradition: row.tradition,
        description: row.description,
        privacy: row.privacy,
        memberCount: 1,
        createdBy: userId,
        pinnedAnnouncement: null,
        joined: true,
      };
      setCovens((prev) => [item, ...prev]);
      return item;
    },
    [userId],
  );

  const updateCoven = useCallback(
    async (
      covenId: string,
      patch: { name: string; description: string | null; privacy: string; pinned_announcement: string | null },
    ) => {
      await api.updateCoven(covenId, patch);
      setCovens((prev) =>
        prev.map((c) =>
          c.id === covenId
            ? {
                ...c,
                name: patch.name,
                description: patch.description,
                privacy: patch.privacy as CovenListItem['privacy'],
                pinnedAnnouncement: patch.pinned_announcement,
              }
            : c,
        ),
      );
    },
    [],
  );

  const adjustMemberCount = useCallback((covenId: string, delta: number) => {
    setCovens((prev) =>
      prev.map((c) => (c.id === covenId ? { ...c, memberCount: Math.max(0, c.memberCount + delta) } : c)),
    );
  }, []);

  return (
    <CovensDataContext.Provider
      value={{ loading, covens, toggleMembership, createCoven, updateCoven, adjustMemberCount }}
    >
      {children}
    </CovensDataContext.Provider>
  );
}

export function useCovensData() {
  const ctx = useContext(CovensDataContext);
  if (!ctx) throw new Error('useCovensData precisa estar dentro de <CovensDataProvider>');
  return ctx;
}
