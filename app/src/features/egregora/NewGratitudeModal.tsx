import { useState } from 'react';
import { useEgregoraData } from '../../context/EgregoraDataContext';
import { useToast } from '../../components/toast/ToastProvider';

// Porte de index.html:4785-4809 (openNewGratitudeModal).
export function NewGratitudeModal({ onDone }: { onDone: () => void }) {
  const { addGratitude } = useEgregoraData();
  const { showToast } = useToast();
  const [guideName, setGuideName] = useState('');
  const [testimony, setTestimony] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const guide = guideName.trim();
    const text = testimony.trim();
    if (!guide || !text) {
      showToast('Preencha o guia e o relato.');
      return;
    }
    setSaving(true);
    try {
      await addGratitude(guide, text);
      onDone();
      showToast('Graça registrada no mural ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível publicar agora.');
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Registrar uma Graça</div>
      <div className="form-field">
        <label htmlFor="gratGuide">Guia / Orixá / Santo</label>
        <input
          id="gratGuide"
          type="text"
          placeholder="Ex: Oxum, São Jorge, Exu Tranca-Rua…"
          maxLength={80}
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="gratTestimony">Seu relato</label>
        <textarea
          id="gratTestimony"
          placeholder="Conte o que aconteceu…"
          maxLength={1000}
          value={testimony}
          onChange={(e) => setTestimony(e.target.value)}
        />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
        {saving ? 'Publicando…' : 'Publicar no Mural'}
      </button>
    </div>
  );
}
