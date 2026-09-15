import { useState } from 'react';
import { useCovensData } from '../../context/CovensDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import type { CovenListItem } from '../../types/covens';

// Porte de index.html:4746-4783 (openEditCovenModal).
export function EditCovenModal({ coven, onSaved, onDone }: {
  coven: CovenListItem;
  onSaved: () => void;
  onDone: () => void;
}) {
  const { updateCoven } = useCovensData();
  const { showToast } = useToast();
  const [name, setName] = useState(coven.name);
  const [description, setDescription] = useState(coven.description || '');
  const [privacy, setPrivacy] = useState(coven.privacy);
  const [pinned, setPinned] = useState(coven.pinnedAnnouncement || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('O coven precisa de um nome.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await updateCoven(coven.id, {
        name: trimmedName,
        description: description.trim() || null,
        privacy,
        pinned_announcement: pinned.trim() || null,
      });
      onSaved();
      onDone();
      showToast('Coven atualizado ✦');
    } catch (err) {
      console.error(err);
      setError('Não foi possível salvar agora.');
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Editar Coven</div>
      <div className="form-field">
        <label htmlFor="editCovenName">Nome</label>
        <input type="text" id="editCovenName" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="editCovenDesc">Descrição</label>
        <textarea
          id="editCovenDesc"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="editCovenPrivacy">Privacidade</label>
        <select id="editCovenPrivacy" value={privacy} onChange={(e) => setPrivacy(e.target.value as typeof privacy)}>
          <option value="public">Público — qualquer um pode entrar</option>
          <option value="approval">Sob aprovação</option>
          <option value="secret">Secreto</option>
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="editCovenPinned">Aviso fixado no mural (opcional)</label>
        <textarea
          id="editCovenPinned"
          maxLength={300}
          placeholder="Ex: Próximo encontro sábado às 20h"
          value={pinned}
          onChange={(e) => setPinned(e.target.value)}
        />
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{error}</div>}
      <button className="btn-primary" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </div>
  );
}
