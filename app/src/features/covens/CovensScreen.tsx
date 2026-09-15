import { useMemo, useState } from 'react';
import { GLYPH, tradColor, tradLabel } from '../../lib/constants';
import { useCovensData } from '../../context/CovensDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import { CovenCard } from './CovenCard';
import { NewCovenModal } from './NewCovenModal';
import { CovenWallModal } from './CovenWallModal';
import styles from './CovensScreen.module.css';

// Porte de index.html:2991-3040 (renderCovens).
export function CovensScreen() {
  const { covens, loading, toggleMembership } = useCovensData();
  const { push, pop } = useModal();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');

  const traditions = useMemo(() => [...new Set(covens.map((c) => c.tradition))], [covens]);
  const filtered = filter === 'all' ? covens : covens.filter((c) => c.tradition === filter);
  const joined = filtered.filter((c) => c.joined);
  const discover = filtered.filter((c) => !c.joined);

  function openWall(covenId: string) {
    const coven = covens.find((c) => c.id === covenId);
    if (!coven) return;
    if (!coven.joined) {
      showToast('Entre no coven para ver o mural.');
      return;
    }
    push(<CovenWallModal covenId={covenId} />);
  }

  function handleToggleJoin(covenId: string) {
    const coven = covens.find((c) => c.id === covenId);
    const wasJoined = coven?.joined;
    toggleMembership(covenId)
      .then(() => {
        if (coven) showToast(!wasJoined ? `Você entrou em ${coven.name} ✦` : `Você saiu de ${coven.name}`);
      })
      .catch(() => showToast('Não foi possível atualizar sua entrada no coven.'));
  }

  function openNewCoven() {
    const id = push(<NewCovenModal onCreated={() => {}} onDone={() => pop(id)} />);
  }

  return (
    <div className={styles.screen}>
      <div className="section-head">
        <div className="section-title">🕯️ Covens & Terreiros</div>
        <div className="section-sub">Comunidades exclusivas por tradição — encontre a sua, ou funde a próxima</div>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginBottom: 18 }} onClick={openNewCoven}>
        + Fundar um Coven
      </button>

      {loading ? (
        <div className="empty-hint">Carregando…</div>
      ) : (
        <>
          {traditions.length > 1 && (
            <div className={styles.filterRow}>
              <button className={`${styles.filterChip} ${filter === 'all' ? styles.active : ''}`} onClick={() => setFilter('all')}>
                Todos
              </button>
              {traditions.map((t) => {
                const col = tradColor(t);
                const active = filter === t;
                return (
                  <button
                    key={t}
                    className={`${styles.filterChip} ${active ? styles.active : ''}`}
                    style={active ? { background: `${col}22`, color: col, borderColor: `${col}55` } : undefined}
                    onClick={() => setFilter(t)}
                  >
                    {GLYPH[t] || '✦'} {tradLabel(t)}
                  </button>
                );
              })}
            </div>
          )}

          {joined.length > 0 && (
            <>
              <div className="section-head" style={{ marginTop: 8 }}>
                <div className="section-title" style={{ fontSize: 17 }}>
                  Seus Covens
                </div>
              </div>
              <div className={styles.grid}>
                {joined.map((c) => (
                  <CovenCard key={c.id} coven={c} onOpen={() => openWall(c.id)} onToggleJoin={() => handleToggleJoin(c.id)} />
                ))}
              </div>
            </>
          )}

          <div className="section-head" style={{ marginTop: joined.length ? 28 : 8 }}>
            <div className="section-title" style={{ fontSize: 17 }}>
              Descobrir
            </div>
          </div>
          {discover.length > 0 ? (
            <div className={styles.grid}>
              {discover.map((c) => (
                <CovenCard key={c.id} coven={c} onOpen={() => openWall(c.id)} onToggleJoin={() => handleToggleJoin(c.id)} />
              ))}
            </div>
          ) : (
            <div className="empty-hint">
              {covens.length === 0
                ? 'Nenhum coven fundado ainda. Que tal ser o(a) primeiro(a)?'
                : joined.length
                  ? 'Você já faz parte de todos os covens disponíveis por aqui.'
                  : 'Nenhum coven encontrado nessa tradição ainda.'}
            </div>
          )}
        </>
      )}
    </div>
  );
}
