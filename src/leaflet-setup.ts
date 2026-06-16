// One-time Leaflet fix for bundlers. The default marker icons reference asset
// URLs that break under Vite + a non-root `base`, yielding invisible pins.
// We use `divIcon` markers throughout (see Map components) so this is belt-and-
// braces, but we still repoint the defaults in case a stock marker slips in.
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Remove the broken auto-detect getter, then set explicit imported URLs.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});
