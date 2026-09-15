import { useEffect, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { initials, tradColor } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';

interface Result {
  id: string;
  display_name: string;
}

// Porte de index.html:3852-3888 (openFindPeopleModal).
export function FindPeopleModal() {
  const { session } = useSession();
  const { followingIds } = useAgoraData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(followingIds);
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
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .searchProfiles(q, session!.user.id)
        .then((rows) => setResults(rows as unknown as Result[]))
        .catch((err) => {
          console.error(err);
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, session]);

  async function handleFollow(id: string) {
    if (!session || following.has(id)) return;
    setFollowing((prev) => new Set(prev).add(id));
    try {
      await api.followUser(session.user.id, id);
    } catch (err) {
      console.error(err);
      setFollowing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div>
      <div className="modal-title">Buscar pessoas</div>
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
      ) : loading ? (
        <div className="empty-hint">Buscando…</div>
      ) : !results?.length ? (
        <div className="empty-hint">Nenhum buscador encontrado.</div>
      ) : (
        results.map((p) => (
          <div key={p.id} className="dm-convo-row" style={{ cursor: 'default' }}>
            <div className="post-head-link" style={{ flex: 1 }}>
              <div className="avatar-sm" style={{ background: tradColor('solitario') }}>
                {initials(p.display_name)}
              </div>
              <div className="dm-convo-info">
                <div className="dm-convo-name">{p.display_name}</div>
              </div>
            </div>
            <button className="btn-ghost" style={{ padding: '6px 14px' }} onClick={() => handleFollow(p.id)}>
              {following.has(p.id) ? 'Seguindo' : 'Seguir'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
