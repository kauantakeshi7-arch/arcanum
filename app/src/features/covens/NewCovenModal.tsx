import { useState } from 'react';
import { GLYPH, TRADITIONS } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import type { CovenListItem } from '../../types/covens';

// Porte de index.html:4475-4515 (openNewCovenModal).
export function NewCovenModal({ onCreated, onDone }: {
  onCreated: (coven: CovenListItem) => void;
  onDone: () => void;
}) {
  const { profile } = useSession();
  const { createCoven } = useCovensData();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [tradition, setTradition] = useState(profile?.religion_path || 'solitario');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'approval' | 'secret'>('public');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Dê um nome ao seu coven.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const coven = await createCoven({ name: trimmedName, tradition, description: description.trim(), privacy });
      onCreated(coven);
      onDone();
      showToast(`${trimmedName} foi fundado ✦`);
    } catch (err) {
      console.error(err);
      setError('Não foi possível fundar o coven agora.');
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Fundar um Coven</div>
      <div className="form-field">
        <label htmlFor="covenName">Nome</label>
        <input
          type="text"
          id="covenName"
          placeholder="Ex: Terreiro dos Filhos de Ogum"
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="covenTradition">Tradição</label>
        <select id="covenTradition" value={tradition} onChange={(e) => setTradition(e.target.value)}>
          {Object.entries(TRADITIONS).map(([k, v]) => (
            <option key={k} value={k}>
              {GLYPH[k]} {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="covenDesc">Descrição</label>
        <textarea
          id="covenDesc"
          placeholder="Sobre o que é este coven?"
          maxLength={300}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="covenPrivacy">Privacidade</label>
        <select id="covenPrivacy" value={privacy} onChange={(e) => setPrivacy(e.target.value as typeof privacy)}>
          <option value="public">Público — qualquer um pode entrar</option>
          <option value="approval">Sob aprovação</option>
          <option value="secret">Secreto</option>
        </select>
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{error}</div>}
      <button className="btn-primary" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
        {saving ? 'Fundando…' : 'Fundar Coven'}
      </button>
    </div>
  );
}
