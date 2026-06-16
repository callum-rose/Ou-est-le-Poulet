import { divIcon } from 'leaflet';
import { Marker } from 'react-leaflet';
import type { Breadcrumb } from '../../types';

const liveIcon = divIcon({
  className: '',
  html: '<div class="live-pin"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function LivePositionMarker({ last }: { last: Breadcrumb | null }) {
  if (!last) return null;
  return <Marker position={[last.lat, last.lng]} icon={liveIcon} />;
}
