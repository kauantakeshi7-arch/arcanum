import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Toast.module.css';

interface ToastEntry {
  id: string;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Porte de index.html:999-1007, 1675-1682 (toast-wrap/.toast e a função
// toast()) — animação de entrada/saída e o swipe-to-dismiss (mobile) agora
// via framer-motion em vez do CSS @keyframes com delay fixo (evita a
// dessincronia entre a duração do CSS e o setTimeout que removia o toast
// do estado).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string) => {
      const id = String(counter.current++);
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => dismiss(id), 2300);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.wrap} role="status" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              className={styles.toast}
              key={t.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              onDragEnd={(_e, info) => {
                if (Math.abs(info.offset.x) > 60) dismiss(t.id);
              }}
              style={{ pointerEvents: 'auto', touchAction: 'pan-y' }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
