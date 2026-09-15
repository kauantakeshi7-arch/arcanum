import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// O Leaflet resolve os ícones padrão por URL relativa ao CSS, o que quebra
// sob um bundler (Vite reescreve os assets com hash). Corrige uma vez,
// globalmente, apontando para os arquivos já processados pelo Vite.
let patched = false;
export function ensureLeafletIcons() {
  if (patched) return;
  patched = true;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}
