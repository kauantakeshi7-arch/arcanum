import { useState } from 'react';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../components/toast/ToastProvider';
import { useStealth } from '../../context/StealthContext';
import { updateProfile } from '../../lib/auth';

// Porte de index.html:3237-3250 (seção Modo Discreto no Perfil) e
// :3691-3705 (salvar pin / testar agora).
export function StealthSection() {
  const { profile, patchProfileLocal } = useSession();
  const { showToast } = useToast();
  const { enterStealth } = useStealth();
  const [pin, setPin] = useState(profile?.stealth_pin || '7777');

  if (!profile) return null;

  async function savePin() {
    const trimmed = pin.trim();
    if (!/^[0-9]{4,8}$/.test(trimmed)) {
      showToast('O código precisa ter só números, de 4 a 8 dígitos.');
      return;
    }
    const prev = profile!.stealth_pin;
    patchProfileLocal({ stealth_pin: trimmed });
    try {
      await updateProfile(profile!.id, { stealth_pin: trimmed });
      showToast('Código do Modo Discreto atualizado ✦');
    } catch (err) {
      patchProfileLocal({ stealth_pin: prev });
      showToast('Não foi possível salvar o código agora.');
      console.error(err);
    }
  }

  return (
    <>
      <div className="section-head" style={{ marginTop: 28 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          🥷 Modo Discreto — Seu Refúgio Seguro
        </div>
      </div>
      <div className="stealth-info-card">
        <p>Sabemos que nem todo mundo pode viver sua fé livremente. Se você mora com quem não entende ou não respeita sua senda espiritual, o Arcanum te protege.</p>
        <p>
          <b>Três toques rápidos no símbolo do Arcanum</b> (o brasão ali no topo da tela) transformam este app, na
          hora, numa calculadora comum e funcional — ninguém vai saber que existe um templo aqui dentro.
        </p>
        <p>
          Para voltar, digite seu <b>código pessoal</b> na calculadora e aperte &quot;=&quot;. Simples assim. Sua
          segurança e privacidade vêm sempre primeiro ✦
        </p>
      </div>
      <div className="form-field">
        <label htmlFor="stealthPinInput">Seu código pessoal (4 a 8 números)</label>
        <input
          id="stealthPinInput"
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={savePin}>
          Salvar código
        </button>
        <button className="btn-primary" style={{ flex: 1, marginTop: 0 }} onClick={enterStealth}>
          Testar agora
        </button>
      </div>
    </>
  );
}
