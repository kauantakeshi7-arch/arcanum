import { useSession } from '../../context/SessionContext';
import { useToast } from '../../components/toast/ToastProvider';
import { updateProfile } from '../../lib/auth';
import {
  DEFAULT_AVATAR_LAYERS,
  DEFAULT_UNLOCKED_ITEMS,
  SHOP_CATEGORY_LABELS,
  SHOP_ITEMS,
  shopItem,
  type ShopCategory,
} from './perfilData';

// Porte de index.html:3148-3165 (renderShopSections) + a lógica otimista de
// buy-shop-item/equip-shop-item (index.html:3474-3513).
export function ShopSection() {
  const { profile, patchProfileLocal } = useSession();
  const { showToast } = useToast();
  if (!profile) return null;

  const layers = profile.avatar_layers || DEFAULT_AVATAR_LAYERS;
  const unlocked = new Set(profile.unlocked_items || DEFAULT_UNLOCKED_ITEMS);

  async function buy(cat: ShopCategory, id: string) {
    if (!profile) return;
    const it = shopItem(cat, id);
    const key = `${cat}:${it.id}`;
    if (unlocked.has(key)) return;
    if (profile.mana_xp < it.cost) {
      showToast('Mana insuficiente para esse item.');
      return;
    }
    const prevMana = profile.mana_xp;
    const prevLayers = layers;
    const prevUnlocked = profile.unlocked_items || DEFAULT_UNLOCKED_ITEMS;
    const nextLayers = { ...layers, [cat]: it.id };
    const nextUnlocked = [...prevUnlocked, key];
    patchProfileLocal({ mana_xp: prevMana - it.cost, avatar_layers: nextLayers, unlocked_items: nextUnlocked });
    try {
      await updateProfile(profile.id, {
        mana_xp: prevMana - it.cost,
        unlocked_items: nextUnlocked,
        avatar_layers: nextLayers,
      });
      showToast(`${it.label} desbloqueado(a) ✦`);
    } catch (err) {
      patchProfileLocal({ mana_xp: prevMana, avatar_layers: prevLayers, unlocked_items: prevUnlocked });
      showToast('Não foi possível concluir a compra agora.');
      console.error(err);
    }
  }

  async function equip(cat: ShopCategory, id: string) {
    if (!profile) return;
    const prevLayers = layers;
    const nextLayers = { ...layers, [cat]: id };
    patchProfileLocal({ avatar_layers: nextLayers });
    try {
      await updateProfile(profile.id, { avatar_layers: nextLayers });
    } catch (err) {
      patchProfileLocal({ avatar_layers: prevLayers });
      showToast('Não foi possível usar esse item agora.');
      console.error(err);
    }
  }

  return (
    <>
      {(Object.entries(SHOP_ITEMS) as [ShopCategory, (typeof SHOP_ITEMS)[ShopCategory]][]).map(([cat, items]) => (
        <div key={cat}>
          <div className="section-sub" style={{ marginBottom: 8 }}>
            {SHOP_CATEGORY_LABELS[cat]}
          </div>
          <div className="shop-grid" style={{ marginBottom: 18 }}>
            {items.map((it) => {
              const key = `${cat}:${it.id}`;
              const isUnlocked = unlocked.has(key);
              const isEquipped = layers[cat] === it.id;
              return (
                <div className={`shop-item ${isEquipped ? 'equipped' : ''}`} key={it.id}>
                  {it.color ? (
                    <div className="shop-swatch" style={{ background: it.color }} />
                  ) : (
                    <div className="shop-swatch shop-swatch-glyph">{it.glyph || '✦'}</div>
                  )}
                  <div className="shop-item-label">{it.label}</div>
                  {isEquipped ? (
                    <button className="btn-ghost shop-btn" disabled>
                      Equipado
                    </button>
                  ) : isUnlocked ? (
                    <button className="btn-ghost shop-btn" onClick={() => equip(cat, it.id)}>
                      Usar
                    </button>
                  ) : (
                    <button className="btn-primary shop-btn" style={{ marginTop: 0 }} onClick={() => buy(cat, it.id)}>
                      {it.cost} Mana
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
