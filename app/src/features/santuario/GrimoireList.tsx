import { useSession } from '../../context/SessionContext';
import { useSantuarioData } from '../../context/SantuarioDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import { exportGrimoirePdf } from '../../lib/exportGrimoirePdf';
import { NewGrimoireModal } from './NewGrimoireModal';
import styles from './SantuarioScreen.module.css';

const TYPE_COLORS: Record<string, string> = {
  ritual: '#D4A853',
  dream: '#8B6CF2',
  meditation: '#34C79A',
  tarot: '#C1614A',
};

// Porte de index.html:2490-2498, 4381-4410 (Grimório Digital + export PDF).
export function GrimoireList() {
  const { profile } = useSession();
  const { grimoire } = useSantuarioData();
  const { push, pop } = useModal();
  const { showToast } = useToast();

  function openNewEntry() {
    const id = push(<NewGrimoireModal onDone={() => pop(id)} />);
  }

  function handleExport() {
    const result = exportGrimoirePdf(profile?.display_name || 'Buscador(a)', grimoire);
    if (result === 'empty') showToast('Seu Grimório ainda está vazio.');
    else if (result === 'popup-blocked') showToast('Permita pop-ups para exportar o PDF.');
  }

  return (
    <>
      <div className="section-head" style={{ marginTop: 24 }}>
        <div className="section-title" style={{ fontSize: 19 }}>
          Grimório Digital
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={openNewEntry}>
          + Novo registro
        </button>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={handleExport}>
          Exportar PDF
        </button>
      </div>
      {grimoire.map((g) => (
        <div className={styles.grimEntry} style={{ '--grim-c': TYPE_COLORS[g.type] || '#8B87A0' } as React.CSSProperties} key={g.id}>
          <div className={styles.grimTop}>
            <span className={styles.grimType} style={{ background: `${TYPE_COLORS[g.type] || '#8B87A0'}22`, color: TYPE_COLORS[g.type] || '#8B87A0' }}>
              {g.type}
            </span>
            <span className={styles.grimDate}>{g.date}</span>
          </div>
          <div className={styles.grimTitle}>{g.title}</div>
          <div className={styles.grimSnippet}>{g.content}</div>
        </div>
      ))}
    </>
  );
}
