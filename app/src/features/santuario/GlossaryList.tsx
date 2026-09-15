import { useState } from 'react';
import { GLOSSARY_CATEGORIES, MAGIC_GLOSSARY } from './santuarioData';
import styles from './SantuarioScreen.module.css';

// Porte de index.html:2485-2488, 2541-2551 (renderGlossaryList).
export function GlossaryList() {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const items = MAGIC_GLOSSARY.filter(
    (g) => !q || g.term.toLowerCase().includes(q) || g.description.toLowerCase().includes(q),
  );

  return (
    <>
      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          📖 Glossário de Correspondências
        </div>
        <div className="section-sub">Ervas, cristais, Orixás/Guias e dias planetários</div>
      </div>
      <div className="form-field">
        <input
          type="text"
          placeholder="Buscar um termo…"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className={styles.glossaryList}>
        {items.length ? (
          items.map((g) => (
            <div className={styles.glossaryItem} key={g.term}>
              <div className={styles.glossaryTerm}>
                {g.term} <span className={styles.glossaryCat}>{GLOSSARY_CATEGORIES[g.category]}</span>
              </div>
              <div className={styles.glossaryDesc}>{g.description}</div>
            </div>
          ))
        ) : (
          <div className="empty-hint">Nenhum termo encontrado.</div>
        )}
      </div>
    </>
  );
}
