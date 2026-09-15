import { useEffect, useRef, useState } from 'react';
import * as api from '../../lib/api';
import { GLYPH, initials, tradColor } from '../../lib/constants';
import { useSession } from '../../context/SessionContext';
import { useAgoraData } from '../../context/AgoraDataContext';
import { useCovensData } from '../../context/CovensDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { ProfileModal } from '../perfil/ProfileModal';
import { CovenWallModal } from '../covens/CovenWallModal';

interface PersonResult {
  id: string;
  display_name: string;
}

// Porte de index.html:3890-3934 (BUSCA CENTRAL / openGlobalSearchModal).
// Pessoas vêm do Supabase (searchProfiles); covens e publicações são
// filtrados sobre os dados já carregados nos respectivos contextos, exatamente
// como no app original (state.covens / state.posts em memória).
export function GlobalSearchModal() {
  const { session } = useSession();
  const { posts } = useAgoraData();
  const { covens } = useCovensData();
  const { push } = useModal();
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<PersonResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !session) {
      setPeople(null);
      return;
    }
    const handle = setTimeout(() => {
      api
        .searchProfiles(q, session.user.id)
        .then((rows) => setPeople(rows as unknown as PersonResult[]))
        .catch((err) => {
          console.error(err);
          setPeople([]);
        });
    }, 300);
    return () => clearTimeout(handle);
  }, [query, session]);

  const q = query.trim();
  const qLower = q.toLowerCase();
  const covenMatches = q.length >= 2 ? covens.filter((c) => c.name.toLowerCase().includes(qLower)).slice(0, 8) : [];
  const postMatches = q.length >= 2 ? posts.filter((p) => (p.content || '').toLowerCase().includes(qLower)).slice(0, 8) : [];
  const nothingFound = q.length >= 2 && people !== null && !people.length && !covenMatches.length && !postMatches.length;

  return (
    <div>
      <div className="modal-title">Buscar</div>
      <div className="form-field">
        <input
          ref={inputRef}
          type="text"
          placeholder="Pessoas, covens ou publicações…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {q.length < 2 ? (
        <div className="empty-hint">Digite ao menos 2 letras.</div>
      ) : nothingFound ? (
        <div className="empty-hint">Nada encontrado.</div>
      ) : (
        <>
          {people?.length ? (
            <>
              <div className="section-sub" style={{ margin: '10px 0 6px' }}>
                Pessoas
              </div>
              {people.map((p) => (
                <button className="dm-convo-row" key={p.id} onClick={() => push(<ProfileModal userId={p.id} />)}>
                  <div className="avatar-sm" style={{ background: tradColor('solitario') }}>
                    {initials(p.display_name)}
                  </div>
                  <div className="dm-convo-info">
                    <div className="dm-convo-name">{p.display_name}</div>
                  </div>
                </button>
              ))}
            </>
          ) : null}
          {covenMatches.length ? (
            <>
              <div className="section-sub" style={{ margin: '10px 0 6px' }}>
                Covens
              </div>
              {covenMatches.map((c) => {
                const col = tradColor(c.tradition);
                return (
                  <button className="dm-convo-row" key={c.id} onClick={() => push(<CovenWallModal covenId={c.id} />)}>
                    <div className="avatar-sm" style={{ background: `${col}22`, color: col }}>
                      {GLYPH[c.tradition] || '✦'}
                    </div>
                    <div className="dm-convo-info">
                      <div className="dm-convo-name">{c.name}</div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : null}
          {postMatches.length ? (
            <>
              <div className="section-sub" style={{ margin: '10px 0 6px' }}>
                Publicações
              </div>
              {postMatches.map((p) => (
                <div className="reflection-item" key={p.id}>
                  <b style={{ color: 'var(--text-hi)' }}>{p.user}</b>
                  <div className="reflection-date">{p.time}</div>
                  {p.content.slice(0, 140)}
                </div>
              ))}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
