import { useEgregoraData } from '../../context/EgregoraDataContext';
import { useModal } from '../../components/modal/ModalProvider';
import { useToast } from '../../components/toast/ToastProvider';
import { NewGratitudeModal } from './NewGratitudeModal';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2924-2936, 2969-2972, 3628-3641 (Mural de Graças Alcançadas).
export function GratitudeWall() {
  const { gratitude, sendFlower } = useEgregoraData();
  const { push, pop } = useModal();
  const { showToast } = useToast();

  function openNewEntry() {
    const id = push(<NewGratitudeModal onDone={() => pop(id)} />);
  }

  async function handleSendFlower(id: string) {
    try {
      await sendFlower(id);
    } catch (err) {
      console.error(err);
      showToast('Não foi possível enviar a flor agora.');
    }
  }

  return (
    <>
      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          Mural de Graças Alcançadas
        </div>
        <div className="section-sub">Gratidão aos Guias, Orixás e Santos</div>
      </div>
      <button className="btn-ghost" style={{ width: '100%', marginBottom: 12 }} onClick={openNewEntry}>
        + Registrar uma Graça
      </button>
      <div style={{ marginBottom: 18 }}>
        {gratitude.length ? (
          gratitude.map((g) => (
            <div className={styles.gratitudeCard} key={g.id}>
              <div className={styles.gratitudeHead}>
                <span className={styles.gratitudeGuide}>✦ {g.guideName}</span>
                <span className={styles.gratitudeDate}>{g.date}</span>
              </div>
              <div className={styles.gratitudeText}>{g.testimony}</div>
              <div className={styles.gratitudeFooter}>
                <span className={styles.gratitudeAuthor}>— {g.by}</span>
                <button className={`${styles.lightBtn} ${g.sent ? styles.active : ''}`} disabled={g.sent} onClick={() => handleSendFlower(g.id)}>
                  {g.sent ? '✿ Enviada' : '🌸 Flor'} {g.flowers > 0 ? `· ${g.flowers}` : ''}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-hint">Nenhuma graça registrada ainda. Compartilhe a sua ✦</div>
        )}
      </div>
    </>
  );
}
