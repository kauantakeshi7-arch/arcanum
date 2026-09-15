import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ensureLeafletIcons } from '../../lib/leafletIcons';
import { useEgregoraData } from '../../context/EgregoraDataContext';
import { useToast } from '../../components/toast/ToastProvider';
import { SACRED_CATEGORIES, SACRED_MAP_DEFAULT_CENTER } from './egregoraData';
import styles from './SacredMap.module.css';

// Porte de index.html:2826-2874 (openNewSacredPlaceModal).
export function NewSacredPlaceModal({ onDone }: { onDone: () => void }) {
  const { sacredPlaces, addSacredPlace } = useEgregoraData();
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(Object.keys(SACRED_CATEGORIES)[0]);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    ensureLeafletIcons();
    if (!containerRef.current || mapRef.current) return;
    const center = sacredPlaces.length
      ? ([sacredPlaces[0].latitude, sacredPlaces[0].longitude] as [number, number])
      : SACRED_MAP_DEFAULT_CENTER;
    const map = L.map(containerRef.current).setView(center, 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    const marker = L.marker(center, { draggable: true }).addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => marker.setLatLng(e.latlng));
    mapRef.current = map;
    markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 150);
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();
    const trimmedCity = city.trim();
    if (!trimmedName || !trimmedAddress || !trimmedCity) {
      showToast('Preencha nome, endereço e cidade.');
      return;
    }
    if (!markerRef.current) {
      showToast('Marque a localização no mapa.');
      return;
    }
    const { lat, lng } = markerRef.current.getLatLng();
    setSaving(true);
    try {
      await addSacredPlace({
        name: trimmedName,
        category,
        address: trimmedAddress,
        city: trimmedCity,
        latitude: lat,
        longitude: lng,
        phone: phone.trim() || null,
      });
      onDone();
      showToast('Local adicionado ao Radar Sagrado ✦');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível adicionar agora.');
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="modal-title">Adicionar ao Radar Sagrado</div>
      <div className="form-field">
        <label htmlFor="spName">Nome do local</label>
        <input id="spName" type="text" placeholder="Ex: Ervanária Caminhos da Terra" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="spCategory">Categoria</label>
        <select id="spCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
          {Object.entries(SACRED_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.glyph} {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor="spAddress">Endereço</label>
        <input id="spAddress" type="text" placeholder="Rua, número" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="spCity">Cidade</label>
        <input id="spCity" type="text" placeholder="Sua cidade" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="spPhone">Telefone (opcional)</label>
        <input id="spPhone" type="text" placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="node-sub" style={{ marginBottom: 8 }}>
        Toque no mapa para marcar a localização exata
      </div>
      <div ref={containerRef} className={styles.pickerMap} />
      <button className="btn-primary" style={{ width: '100%' }} disabled={saving} onClick={handleSubmit}>
        {saving ? 'Adicionando…' : 'Adicionar'}
      </button>
    </div>
  );
}
