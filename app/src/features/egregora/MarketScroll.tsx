import { MARKET_ITEMS } from './egregoraData';
import styles from './EgregoraScreen.module.css';

// Porte de index.html:2917-2922, 2974-2977 (Desapego Sagrado). Vitrine
// estática — sem carrinho ou compra real, como no app original.
export function MarketScroll() {
  return (
    <>
      <div className="section-head">
        <div className="section-title" style={{ fontSize: 19 }}>
          Desapego Sagrado
        </div>
      </div>
      <div className={styles.marketScroll}>
        {MARKET_ITEMS.map((m) => (
          <div className={styles.marketItem} key={m.name}>
            <div className={styles.marketThumb} style={{ background: `linear-gradient(160deg, ${m.color}44, ${m.color}11)` }} />
            <div className={styles.marketName}>{m.name}</div>
            <div className={styles.marketPrice}>{m.price}</div>
          </div>
        ))}
      </div>
    </>
  );
}
