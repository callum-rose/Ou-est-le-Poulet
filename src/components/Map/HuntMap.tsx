import { useEffect } from 'react';
import { latLngBounds } from 'leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { appConfig } from '../../config/app.config';
import type { Breadcrumb, Pub } from '../../types';
import { LivePositionMarker } from './LivePositionMarker';
import { PubMarkers } from './PubMarkers';
import { RouteTrail } from './RouteTrail';

/** Fit the view to all pubs (plus the live fix) once on mount. */
function FitToPubs({ pubs, last }: { pubs: readonly Pub[]; last: Breadcrumb | null }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = pubs.map((p) => [p.lat, p.lng]);
    if (last) points.push([last.lat, last.lng]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], appConfig.map.fallbackZoom);
      return;
    }
    map.fitBounds(latLngBounds(points), { padding: [40, 40] });
    // Fit only on first mount; live updates shouldn't yank the view around.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

interface HuntMapProps {
  pubs: readonly Pub[];
  visitedIds: Set<string>;
  last: Breadcrumb | null;
  crumbs: readonly Breadcrumb[];
  onSelectPub?: (pubId: string) => void;
}

export function HuntMap({
  pubs,
  visitedIds,
  last,
  crumbs,
  onSelectPub,
}: HuntMapProps) {
  return (
    <MapContainer
      className="hunt-map"
      center={appConfig.map.fallbackCenter}
      zoom={appConfig.map.fallbackZoom}
      maxZoom={appConfig.map.maxZoom}
      scrollWheelZoom
    >
      <TileLayer
        url={appConfig.map.tileUrl}
        attribution={appConfig.map.tileAttribution}
        maxZoom={appConfig.map.maxZoom}
      />
      <FitToPubs pubs={pubs} last={last} />
      <RouteTrail crumbs={crumbs} />
      <PubMarkers pubs={pubs} visitedIds={visitedIds} onSelect={onSelectPub} />
      <LivePositionMarker last={last} />
    </MapContainer>
  );
}
