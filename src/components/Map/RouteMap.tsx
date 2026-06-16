import { useEffect } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { appConfig } from '../../config/app.config';
import type { Breadcrumb, Pub } from '../../types';
import { RouteTrail } from './RouteTrail';

/** Round, numbered pin so the visit order reads clearly (unlike the rotated diamonds). */
function orderedPinIcon(order: number) {
  return divIcon({
    className: '',
    html: `<div class="route-pin">${order}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    tooltipAnchor: [14, 0],
  });
}

/**
 * Fit the view to the whole route once on mount, and re-measure the container.
 * The screen enter-animation transforms the map's ancestor, so Leaflet measures
 * the wrong size at mount and leaves tiles unpainted (see PubMiniMap).
 */
function FitToRoute({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 300);
    if (points.length === 1) {
      map.setView(points[0], appConfig.map.fallbackZoom);
    } else if (points.length > 1) {
      map.fitBounds(latLngBounds(points), { padding: [36, 36] });
    }
    return () => clearTimeout(t);
    // Fit once on mount; the route never changes on this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface RouteMapProps {
  /** Visited pubs in arrival order — the team's route. */
  route: readonly Pub[];
  /** GPS breadcrumb trail, drawn faintly beneath the pub-to-pub route. */
  crumbs: readonly Breadcrumb[];
}

/** Read-only map of the completed route: ordered pub stops joined by a line. */
export function RouteMap({ route, crumbs }: RouteMapProps) {
  const stops = route.map((p) => [p.lat, p.lng] as [number, number]);
  const fitPoints = [...stops, ...crumbs.map((c) => [c.lat, c.lng] as [number, number])];

  return (
    <MapContainer
      className="route-map"
      center={appConfig.map.fallbackCenter}
      zoom={appConfig.map.fallbackZoom}
      maxZoom={appConfig.map.maxZoom}
      scrollWheelZoom={false}
    >
      <TileLayer
        url={appConfig.map.tileUrl}
        attribution={appConfig.map.tileAttribution}
        maxZoom={appConfig.map.maxZoom}
      />
      <FitToRoute points={fitPoints} />
      <RouteTrail crumbs={crumbs} />
      {stops.length >= 2 && (
        <Polyline
          positions={stops}
          pathOptions={{
            // Concrete colour — Leaflet writes this to the SVG stroke attribute,
            // which does not resolve CSS custom properties.
            color: '#912f40',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}
      {route.map((pub, i) => (
        <Marker key={pub.id} position={[pub.lat, pub.lng]} icon={orderedPinIcon(i + 1)}>
          <Tooltip direction="right" offset={[12, 0]}>
            {pub.name}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
