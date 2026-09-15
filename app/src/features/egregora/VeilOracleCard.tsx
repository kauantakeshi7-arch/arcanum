import { useState } from 'react';
import * as api from '../../lib/api';
import { VEIL_CATEGORIES, drawVeilResponse } from './egregoraData';
import type { VeilExchange } from '../../types/egregora';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2742-2792 (askVeil/renderVeilOracleCard, sem a Mesa de
// Tarot — fica para uma fase futura). A resposta tenta a Edge Function
// guardian-ai primeiro; se falhar, cai numa frase fixa de VEIL_RESPONSES.
export function VeilOracleCard() {
  const [category, setCategory] = useState('geral');
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<VeilExchange[]>([]);
  const [asking, setAsking] = useState(false);

  async function handleAsk() {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    try {
      const aiAnswer = await api.askGuardianAI(category, q);
      const answer = aiAnswer || drawVeilResponse(category);
      setHistory((prev) => [...prev, { q, a: answer }].slice(-5));
      setQuestion('');
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className={styles.veilCard}>
      <div className="section-title" style={{ fontSize: 19 }}>
        🔮 O Guardião do Véu
      </div>
      <div className="node-sub" style={{ marginBottom: 12 }}>
        Traga sua dúvida sobre ervas, guias, astrologia ou correspondências — o Véu responde com o que a tradição ensina.
      </div>
      {history.length > 0 && (
        <div className={styles.veilHistory}>
          {history.map((h, i) => (
            <div className={styles.veilExchange} key={i}>
              <div className={styles.veilQuestion}>"{h.q}"</div>
              <div className={styles.veilAnswer}>🕯️ {h.a}</div>
            </div>
          ))}
        </div>
      )}
      <div className="form-field">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.entries(VEIL_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <input
          type="text"
          aria-label="Sua pergunta ao Guardião"
          placeholder="Escreva sua pergunta…"
          style={{ flex: 1 }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
        />
        <button className="btn-ghost" disabled={asking} onClick={handleAsk}>
          {asking ? 'Consultando…' : 'Perguntar'}
        </button>
      </div>
    </div>
  );
}
