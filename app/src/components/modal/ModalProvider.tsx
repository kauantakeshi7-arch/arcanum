import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './Modal.module.css';

interface ModalEntry {
  id: string;
  content: ReactNode;
}

interface ModalContextValue {
  push: (content: ReactNode) => string;
  pop: (id?: string) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

// Substitui o antigo openModal(html)/closeModal() (injeção de string num
// #modalSheet único, ver index.html:1686/1697) por uma pilha de verdade —
// mesmo contrato de UX (Escape fecha, foco volta pro elemento anterior), mas
// suporta modal-sobre-modal (ex: menu de post → confirmar exclusão), que o
// app antigo não fazia de forma limpa.
export function ModalProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<ModalEntry[]>([]);
  const lastFocused = useRef<HTMLElement | null>(null);

  const push = useCallback((content: ReactNode) => {
    lastFocused.current = document.activeElement as HTMLElement;
    const id = crypto.randomUUID();
    setStack((s) => [...s, { id, content }]);
    return id;
  }, []);

  const pop = useCallback((id?: string) => {
    setStack((s) => (id ? s.filter((m) => m.id !== id) : s.slice(0, -1)));
    lastFocused.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && stack.length) pop();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stack.length, pop]);

  return (
    <ModalContext.Provider value={{ push, pop }}>
      {children}
      {stack.map((m) => (
        <div key={m.id} className={styles.overlay} onClick={() => pop(m.id)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            {m.content}
          </div>
        </div>
      ))}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal precisa estar dentro de <ModalProvider>');
  return ctx;
}
