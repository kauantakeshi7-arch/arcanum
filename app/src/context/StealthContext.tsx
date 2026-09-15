import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { useSession } from './SessionContext';
import { StealthCalculator } from '../features/stealth/StealthCalculator';

interface StealthContextValue {
  handleBrandTap: () => void;
  enterStealth: () => void;
}

const StealthContext = createContext<StealthContextValue | null>(null);

// Porte de index.html:3329-3357 (Modo Discreto). Três toques rápidos no
// brasão do Arcanum escondem o app inteiro atrás de uma calculadora real.
// O conteúdo normal fica escondido via display:none (não desmontado), para
// não perder estado nem refazer buscas ao voltar — igual ao app original.
export function StealthProvider({ children }: { children: ReactNode }) {
  const { profile } = useSession();
  const [active, setActive] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enterStealth() {
    setActive(true);
  }

  function handleBrandTap() {
    tapCount.current++;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1100);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      enterStealth();
    }
  }

  return (
    <StealthContext.Provider value={{ handleBrandTap, enterStealth }}>
      <div style={{ display: active ? 'none' : 'contents' }}>{children}</div>
      {active && (
        <StealthCalculator pin={profile?.stealth_pin || '7777'} onExit={() => setActive(false)} />
      )}
    </StealthContext.Provider>
  );
}

// Fora de <StealthProvider> (ex.: em testes de componentes isolados), o
// brasão e o botão "Testar agora" simplesmente não fazem nada — não lança.
export function useStealth() {
  const ctx = useContext(StealthContext);
  return (
    ctx || {
      handleBrandTap: () => {},
      enterStealth: () => {},
    }
  );
}
