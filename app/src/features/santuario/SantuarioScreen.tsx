import { AltarScene } from './AltarScene';
import { StreakRow } from './StreakRow';
import { OracleCard } from './OracleCard';
import { AlchemyLab } from './AlchemyLab';
import { SigilTool } from './SigilTool';
import { GlossaryList } from './GlossaryList';
import { GrimoireList } from './GrimoireList';
import { useSantuarioData } from '../../context/SantuarioDataContext';
import styles from './SantuarioScreen.module.css';

// Porte de index.html:2406-2506 (renderSantuario).
export function SantuarioScreen() {
  const { loading } = useSantuarioData();

  return (
    <div className={styles.screen}>
      <div className="section-head">
        <div className="section-title">Santuário Pessoal</div>
        <div className="section-sub">Seu altar, seu grimório, seu oráculo</div>
      </div>

      <AltarScene />
      <StreakRow />

      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          Oráculo do Amanhecer
        </div>
      </div>
      <OracleCard />

      <AlchemyLab />
      <SigilTool />
      <GlossaryList />
      {loading ? <div className="empty-hint">Carregando…</div> : <GrimoireList />}
    </div>
  );
}
