import { useState } from 'react';
import { CANDLE_COLORS } from './santuarioData';
import styles from './SantuarioScreen.module.css';

// Porte de index.html:2362-2405, 2447-2449 (renderAltarSVG + swatches). A cor
// da vela é só de sessão (nunca foi persistida no app original).
export function AltarScene() {
  const [candleColor, setCandleColor] = useState('gold');
  const flameColor = CANDLE_COLORS[candleColor];

  return (
    <>
      <div className={styles.altarScene}>
        <svg viewBox="0 0 300 210" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <ellipse cx="150" cy="196" rx="110" ry="10" fill="#000" opacity="0.35" />
          <g>
            <rect x="80" y="150" width="4" height="46" fill="#3a2f1f" />
            <circle cx="82" cy="148" r="2.5" fill="#e08a3c" />
            <g opacity="0.55">
              <circle className={styles.smokeP} cx="82" cy="138" r="4" fill="#cfcfe0" />
              <circle className={styles.smokeP} cx="86" cy="118" r="6" fill="#cfcfe0" style={{ animationDelay: '.6s' }} />
              <circle className={styles.smokeP} cx="80" cy="96" r="8" fill="#cfcfe0" style={{ animationDelay: '1.2s' }} />
            </g>
          </g>
          <polygon points="222,196 210,165 222,140 234,165" fill="#8B6CF2" opacity="0.55" stroke="#B3A0F7" strokeWidth="1" />
          <polygon points="238,196 231,172 238,155 246,172" fill="#34C79A" opacity="0.5" stroke="#6fe0bb" strokeWidth="1" />
          <path d="M130 196 v-14 a20 8 0 0040 0 v14 z" fill="none" stroke="#D4A853" strokeWidth="2" />
          <ellipse cx="150" cy="182" rx="20" ry="7" fill="#D4A85333" />
          <rect x="146" y="150" width="16" height="46" rx="2" fill="#EDEAE3" opacity="0.9" />
          <rect x="146" y="150" width="16" height="46" rx="2" fill="url(#candleShade)" />
          <g className={styles.flameFlicker}>
            <path d="M154 110 C146 124, 148 136, 154 150 C160 136, 162 124, 154 110 Z" fill={flameColor} />
            <path d="M154 122 C150 130, 151 138, 154 146 C157 138, 158 130, 154 122 Z" fill="#FFF3D6" opacity="0.85" />
          </g>
          <defs>
            <linearGradient id="candleShade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className={styles.swatches}>
        {Object.entries(CANDLE_COLORS).map(([key, color]) => (
          <button
            key={key}
            className={`${styles.swatch} ${candleColor === key ? styles.active : ''}`}
            style={{ background: color }}
            aria-label={`Vela cor ${key}`}
            aria-pressed={candleColor === key}
            onClick={() => setCandleColor(key)}
          />
        ))}
      </div>
    </>
  );
}
