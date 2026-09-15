import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import { usePwaInstall } from '../../lib/pwaInstall';

// Porte de index.html:3267-3295 (renderInstallSection/triggerInstall), a
// seção equivalente dentro do Perfil (o InstallBanner cobre o topo do shell).
export function InstallSection() {
  const { isStandalone, canShowInstallPromo, triggerInstall } = usePwaInstall();
  const { push } = useModal();
  const { showToast } = useToast();

  if (isStandalone) {
    return (
      <div className="section-head" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          📲 Aplicativo
        </div>
        <div className="section-sub">Você já está usando o Arcanum instalado ✦</div>
      </div>
    );
  }
  if (!canShowInstallPromo) return null;

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
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          📲 Instalar Aplicativo
        </div>
        <div className="section-sub">Tenha o Arcanum na tela inicial do seu celular, com acesso rápido como um app</div>
      </div>
      <button className="btn-primary" style={{ width: '100%', marginBottom: 22 }} onClick={install}>
        Instalar na tela inicial
      </button>
    </>
  );
}
