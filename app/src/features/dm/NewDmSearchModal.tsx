import { useEffect, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { initials, tradColor } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useToast } from '../../components/toast/ToastProvider';
import { DmThreadModal } from './DmThreadModal';

interface Result {
  id: string;
  display_name: string;
}

// Porte de index.html:3811-3850 (openNewDmSearch).
export function NewDmSearchModal({ onOpenThread }: { onOpenThread: (content: React.ReactNode) => void }) {
  const { session } = useSession();
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    const handle = setTimeout(() => {
      api
        .searchProfiles(q, session!.user.id)
        .then((rows) => setResults(rows as unknown as Result[]))
        .catch((err) => {
          console.error(err);
          setResults([]);
        });
    }, 300);
    return () => clearTimeout(handle);
  }, [query, session]);

  async function handlePick(person: Result) {
    if (!session) return;
    try {
      const convo = await api.getOrCreateConversation(session.user.id, person.id);
      onOpenThread(<DmThreadModal conversationId={convo.id} otherId={person.id} otherName={person.display_name} />);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível iniciar a conversa.');
    }
  }

  return (
    <div>
      <div className="modal-title">Nova conversa</div>
      <div className="form-field">
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar pelo nome de exibição…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {query.trim().length < 2 ? (
        <div className="empty-hint">Digite ao menos 2 letras.</div>
      ) : !results?.length ? (
        <div className="empty-hint">{results === null ? 'Buscando…' : 'Nenhum buscador encontrado.'}</div>
      ) : (
        results.map((p) => (
          <button key={p.id} className="dm-convo-row" onClick={() => handlePick(p)}>
            <div className="avatar-sm" style={{ background: tradColor('solitario') }}>
              {initials(p.display_name)}
            </div>
            <div className="dm-convo-info">
              <div className="dm-convo-name">{p.display_name}</div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
