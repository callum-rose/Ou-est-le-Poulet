import { Polyline } from 'react-leaflet';
import type { Breadcrumb } from '../../types';

export function RouteTrail({ crumbs }: { crumbs: readonly Breadcrumb[] }) {
  if (crumbs.length < 2) return null;
  const positions = crumbs.map((c) => [c.lat, c.lng] as [number, number]);
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        // Leaflet writes this straight to the SVG `stroke` attribute, which
        // does not resolve CSS custom properties — use a concrete colour.
        color: '#3b9dff',
        weight: 4,
        opacity: 0.7,
        dashArray: '1 8',
        lineCap: 'round',
      }}
    />
  );
}
