import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcons } from '../../lib/leafletIcons';
import { useEgregoraData } from '../../context/EgregoraDataContext';
import { SACRED_CATEGORIES, SACRED_MAP_DEFAULT_CENTER } from './egregoraData';
import styles from './SacredMap.module.css';

// Leaflet injeta o conteúdo do popup via innerHTML — diferente do JSX, isso
// não escapa sozinho, então texto vindo do banco (nome/endereço/cidade/
// telefone) precisa passar por aqui antes de virar HTML.
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);
}

// Porte de index.html:2811-2825 (initSacredMap). O mapa é uma dependência
// real (npm) agora, não mais um script solto via CDN.
export function SacredMap() {
  const { sacredPlaces } = useEgregoraData();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    ensureLeafletIcons();
    if (!containerRef.current || mapRef.current) return;
    const center = sacredPlaces.length
      ? ([sacredPlaces[0].latitude, sacredPlaces[0].longitude] as [number, number])
      : SACRED_MAP_DEFAULT_CENTER;
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers: L.Marker[] = [];
    sacredPlaces.forEach((place) => {
      const info = SACRED_CATEGORIES[place.category] || { glyph: '✦', label: place.category };
      const icon = L.divIcon({
        className: styles.markerIcon,
        html: `<div class="${styles.markerBadge}">${info.glyph}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });
      const marker = L.marker([place.latitude, place.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<b>${info.glyph} ${escapeHtml(place.name)}</b><br>${escapeHtml(place.address)}, ${escapeHtml(place.city)}${place.phone ? '<br>' + escapeHtml(place.phone) : ''}`,
        );
      markers.push(marker);
    });
    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [sacredPlaces]);

  return <div ref={containerRef} className={styles.mapContainer} />;
}
