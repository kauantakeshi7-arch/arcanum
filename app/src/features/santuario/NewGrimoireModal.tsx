import { useState } from 'react';
import { useSantuarioData } from '../../context/SantuarioDataContext';
import { useToast } from '../../components/toast/ToastProvider';

// Porte de index.html:4411-4456 (openNewGrimoireModal).
export function NewGrimoireModal({ onDone }: { onDone: () => void }) {
  const { addGrimoireEntry } = useSantuarioData();
  const { showToast } = useToast();
  const [type, setType] = useState('dream');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      showToast('Preencha título e conteúdo.');
      return;
    }
    setSaving(true);
    try {
      const { streakKept, streakDays } = await addGrimoireEntry(type, trimmedTitle, trimmedContent);
      onDone();
      showToast(streakKept ? `Chama Sagrada mantida! ${streakDays} dias 🔥` : 'Registro guardado no Grimório ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível guardar agora. Tente de novo.');
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Novo Registro</div>
      <div className="form-field">
        <label htmlFor="grimType">Tipo</label>
        <select id="grimType" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="dream">Sonho</option>
          <option value="ritual">Ritual</option>
          <option value="meditation">Meditação</option>
          <option value="tarot">Tarot</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="grimTitle">Título</label>
        <input id="grimTitle" type="text" placeholder="Dê um nome ao registro" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="grimContent">Conteúdo</label>
        <textarea id="grimContent" placeholder="Descreva livremente…" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
        {saving ? 'Guardando…' : 'Guardar no Grimório'}
      </button>
    </div>
  );
}
