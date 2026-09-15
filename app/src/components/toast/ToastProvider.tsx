import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import styles from './Toast.module.css';

interface ToastEntry {
  id: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Porte de index.html:999-1007, 1675-1682 (toast-wrap/.toast e a função toast()).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = String(counter.current++);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.wrap} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className={styles.toast} key={t.id}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
