import { useCallback, useEffect, useState } from 'react';

// Porte de index.html:3256-3311 (INSTALAR APP / PWA). O evento
// beforeinstallprompt só dispara uma vez por carga de página, então o
// listener fica fora do React (module-level) e o hook só espelha o estado.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

function isStandaloneMode(): boolean {
  const mediaMatch = typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  return mediaMatch || (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

function isIOSDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
}

const DISMISS_KEY = 'arcanum_install_dismissed';

export function usePwaInstall() {
  const [, setTick] = useState(0);
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISS_KEY));

  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const standalone = isStandaloneMode();
  const canShowInstallPromo = !standalone && (!!deferredPrompt || isIOSDevice());

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  }, []);

  const triggerInstall = useCallback(async (onIOSInstructions: () => void, onUnavailable: () => void) => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (err) {
        console.error(err);
      }
      deferredPrompt = null;
      notify();
      return;
    }
    if (isIOSDevice()) {
      onIOSInstructions();
      return;
    }
    onUnavailable();
  }, []);

  return { isStandalone: standalone, canShowInstallPromo, dismissed, dismiss, triggerInstall };
}
