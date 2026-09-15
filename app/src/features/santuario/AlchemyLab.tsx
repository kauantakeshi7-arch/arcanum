import { useState } from 'react';
import { downloadCardImage } from '../../lib/canvasCard';
import { useSantuarioData } from '../../context/SantuarioDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import { ALCHEMY_RECIPES } from './santuarioData';
import styles from './SantuarioScreen.module.css';

// Porte de index.html:2462-2472, 2561-2604 (alchemy-lab/renderAlchemyResult/saveAlchemyToGrimoire).
export function AlchemyLab() {
  const { addGrimoireEntry } = useSantuarioData();
  const { showToast } = useToast();
  const [goal, setGoal] = useState(Object.keys(ALCHEMY_RECIPES)[0]);
  const [revealed, setRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  const recipe = ALCHEMY_RECIPES[goal];
  const lines = [
    `Ervas: ${recipe.herbs.join(', ')}`,
    `Fase lunar ideal: ${recipe.moon}`,
    `Dia regente: ${recipe.day}`,
    `Planeta regente: ${recipe.planet}`,
    `Cor da vela: ${recipe.candle}`,
  ];

  async function handleSave() {
    setSaving(true);
    try {
      await addGrimoireEntry('ritual', `Receita: ${recipe.label}`, lines.join('\n'));
      showToast('Receita guardada no Grimório ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível guardar agora.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    try {
      await downloadCardImage('✦ ' + recipe.label, lines, 'arcanum-receita.png');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível gerar a imagem.');
    }
  }

  return (
    <div className={styles.alchemyLab}>
      <div className="section-title" style={{ fontSize: 19, marginBottom: 2 }}>
        Laboratório Alquímico
      </div>
      <div className="node-sub" style={{ marginBottom: 10 }}>
        Escolha seu objetivo e receba a receita mágica correspondente
      </div>
      <div className="form-field">
        <select value={goal} onChange={(e) => { setGoal(e.target.value); setRevealed(false); }}>
          {Object.entries(ALCHEMY_RECIPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <button className="btn-primary" style={{ width: '100%', marginTop: 0 }} onClick={() => setRevealed(true)}>
        Calcular Receita
      </button>
      {revealed && (
        <div className={styles.alchemyResult}>
          <div className={styles.alchemyResultTitle}>✦ {recipe.label}</div>
          <div className={styles.alchemyRow}>
            <span>🌿 Ervas</span>
            <b>{recipe.herbs.join(', ')}</b>
          </div>
          <div className={styles.alchemyRow}>
            <span>🌙 Fase lunar ideal</span>
            <b>{recipe.moon}</b>
          </div>
          <div className={styles.alchemyRow}>
            <span>📅 Dia regente</span>
            <b>{recipe.day}</b>
          </div>
          <div className={styles.alchemyRow}>
            <span>☉ Planeta regente</span>
            <b>{recipe.planet}</b>
          </div>
          <div className={styles.alchemyRow}>
            <span>🕯️ Cor da vela</span>
            <b>{recipe.candle}</b>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn-ghost" style={{ flex: 1 }} disabled={saving} onClick={handleSave}>
              Guardar no Grimório
            </button>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={handleDownload}>
              Baixar imagem
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
