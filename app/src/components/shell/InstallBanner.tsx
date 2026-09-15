import { useModal } from '../modal/ModalProvider';
import { useToast } from '../toast/ToastProvider';
import { usePwaInstall } from '../../lib/pwaInstall';

// Porte de index.html:1357-1376 (banner de instalação no topo do shell).
export function InstallBanner() {
  const { isStandalone, canShowInstallPromo, dismissed, dismiss, triggerInstall } = usePwaInstall();
  const { push } = useModal();
  const { showToast } = useToast();

  if (isStandalone || !canShowInstallPromo || dismissed) return null;

  function install() {
    triggerInstall(
      () =>
        push(
          <div>
            <div className="modal-title">Instalar o Arcanum</div>
            <div className="node-sub" style={{ marginBottom: 14 }}>
              No Safari, toque no ícone de compartilhar na barra do navegador e escolha <b>&quot;Adicionar à Tela de Início&quot;</b>.
            </div>
            <div className="node-sub">Depois disso, o Arcanum aparece como um app junto dos outros no seu celular ✦</div>
          </div>,
        ),
      () => showToast('Seu navegador ainda não confirmou que a instalação está disponível. Tente recarregar a página.'),
    );
  }

  return (
    <div className="install-banner">
      <div className="install-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="url(#gradInstallBanner)" strokeWidth="1.1">
          <defs>
            <linearGradient id="gradInstallBanner" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="#D4A853" />
              <stop offset="100%" stopColor="#8B6CF2" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="9.3" />
          <path d="M12 2.7 L19.5 17.3 H4.5 Z" />
        </svg>
      </div>
      <div className="install-banner-text">
        <div className="install-banner-title">Instale o Arcanum</div>
        <div className="install-banner-sub">Acesso rápido direto da tela inicial, como um app.</div>
      </div>
      <button className="btn-primary install-banner-btn" style={{ marginTop: 0 }} onClick={install}>
        Instalar
      </button>
      <button className="install-banner-close" aria-label="Fechar" onClick={dismiss}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
