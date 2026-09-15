import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../lib/api';
import { useSession } from './SessionContext';

interface DmDataContextValue {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const DmDataContext = createContext<DmDataContextValue | null>(null);

// Porte de index.html:4211-4227 (refreshBadgeCounts, só a parte de DM — o
// badge de notificações continua fora de escopo por enquanto).
export function DmDataProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const userId = session?.user.id;
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!userId) return;
    try {
      const count = await api.fetchUnreadMessageCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <DmDataContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </DmDataContext.Provider>
  );
}

export function useDmData() {
  const ctx = useContext(DmDataContext);
  if (!ctx) throw new Error('useDmData precisa estar dentro de <DmDataProvider>');
  return ctx;
}
