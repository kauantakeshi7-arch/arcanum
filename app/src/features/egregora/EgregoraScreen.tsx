import { useSession } from '../../context/SessionContext';
import { VeilOracleCard } from './VeilOracleCard';
import { MoonRitualCard } from './MoonRitualCard';
import { AffinitiesList } from './AffinitiesList';
import { CandlesMural } from './CandlesMural';
import { GratitudeWall } from './GratitudeWall';
import { MarketScroll } from './MarketScroll';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2889-2980 (renderEgregora). Radar Sagrado (mapa
// Leaflet) e Mesa de Tarot ficam para uma fase futura.
export function EgregoraScreen() {
  const { profile } = useSession();

  return (
    <div className={styles.screen}>
      <div className="section-head">
        <div className="section-title">Egrégora & Conexões</div>
        <div className="section-sub">Comunidade, apoio e sincronicidade</div>
      </div>

      <VeilOracleCard />
      <MoonRitualCard />

      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          Sinastria Cósmica
        </div>
        <div className="section-sub">
          Seu Sol em {profile?.sun_sign || '—'} · Lua em {profile?.moon_sign || '—'} · Ascendente em {profile?.ascendant_sign || '—'}
        </div>
      </div>
      <AffinitiesList />

      <CandlesMural />
      <GratitudeWall />
      <MarketScroll />
    </div>
  );
}
