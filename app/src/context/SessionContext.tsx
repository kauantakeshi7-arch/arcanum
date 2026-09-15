import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { getProfile } from '../lib/auth';
import type { Profile } from '../types/db';

interface SessionContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  adjustManaXp: (delta: number) => void;
  patchProfileLocal: (patch: Partial<Profile>) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // onAuthStateChange pode disparar antes de ensureProfile() (chamado por
  // signIn/signUp em lib/auth.ts) terminar de inserir a linha em profiles —
  // sem essa corrida, um retry aqui seria desnecessário. Uma tentativa extra
  // depois de uma pequena espera cobre essa janela sem mascarar erros reais.
  async function loadProfile(userId: string, attempt = 0) {
    try {
      const p = await getProfile(userId);
      setProfile(p);
    } catch (err) {
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return loadProfile(userId, attempt + 1);
      }
      console.error('Falha ao carregar profile:', err);
      setProfile(null);
    }
  }

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) loadProfile(newSession.user.id);
      else setProfile(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (session) await loadProfile(session.user.id);
  }

  // Atualização local otimista de mana_xp (Trilhas/Passe Lunar já persistem a
  // mudança real via updateProfile — isso só evita esperar um refetch).
  function adjustManaXp(delta: number) {
    setProfile((prev) => (prev ? { ...prev, mana_xp: prev.mana_xp + delta } : prev));
  }

  // Idem, genérico — usado pela Chama Sagrada (streak_days/logged_today_at)
  // depois que a escrita real no Supabase já foi disparada.
  function patchProfileLocal(patch: Partial<Profile>) {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <SessionContext.Provider value={{ session, profile, loading, refreshProfile, adjustManaXp, patchProfileLocal }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession precisa estar dentro de <SessionProvider>');
  return ctx;
}
