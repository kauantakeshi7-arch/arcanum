import { useSession } from '../../context/SessionContext';
import { useModal } from '../../components/modal/ModalProvider';
import { VeilOracleCard } from './VeilOracleCard';
import { MoonRitualCard } from './MoonRitualCard';
import { AffinitiesList } from './AffinitiesList';
import { SacredMap } from './SacredMap';
import { NewSacredPlaceModal } from './NewSacredPlaceModal';
import { CandlesMural } from './CandlesMural';
import { GratitudeWall } from './GratitudeWall';
import { MarketScroll } from './MarketScroll';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2889-2980 (renderEgregora). Mesa de Tarot fica para
// uma fase futura.
export function EgregoraScreen() {
  const { profile } = useSession();
  const { push, pop } = useModal();

  function openNewPlace() {
    const id = push(<NewSacredPlaceModal onDone={() => pop(id)} />);
  }

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

      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          🗺️ Radar Sagrado
        </div>
        <div className="section-sub">Ervanárias, terreiros, templos e lojas perto de você</div>
      </div>
      <SacredMap />
      <button className="btn-ghost" style={{ width: '100%', marginBottom: 18 }} onClick={openNewPlace}>
        + Adicionar local
      </button>

      <CandlesMural />
      <GratitudeWall />
      <MarketScroll />
    </div>
  );
}
