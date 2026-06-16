import { useEffect } from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { appConfig, copy } from '../../config/app.config';
import type { Pub } from '../../types';

// Reuse the hunt-map pin styling; static so no image-asset bug to worry about.
const pubIcon = divIcon({
  className: '',
  html: '<div class="pub-pin pub-pin--unvisited"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

/**
 * The screen enter-animation transforms this map's container, so Leaflet
 * measures the wrong size at mount and leaves part of the tile grid unpainted.
 * Re-measure once immediately and again after the 260ms animation settles.
 */
function InvalidateSizeOnMount() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

interface PubMiniMapProps {
  pub: Pub;
  onClick: () => void;
}

/**
 * A small, non-interactive map preview of a single pub. The map itself ignores
 * pointer events (see .pub-minimap__map) so a tap anywhere falls through to the
 * wrapping button, which opens the pub in Google Maps.
 */
export function PubMiniMap({ pub, onClick }: PubMiniMapProps) {
  return (
    <button
      type="button"
      className="pub-minimap"
      onClick={onClick}
      aria-label={`${copy.pubMiniMap.openAriaPrefix} ${pub.name} ${copy.pubMiniMap.openAriaSuffix}`}
    >
      <MapContainer
        className="pub-minimap__map"
        center={[pub.lat, pub.lng]}
        zoom={16}
        maxZoom={appConfig.map.maxZoom}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={appConfig.map.tileUrl} maxZoom={appConfig.map.maxZoom} />
        <Marker
          position={[pub.lat, pub.lng]}
          icon={pubIcon}
          interactive={false}
        />
        <InvalidateSizeOnMount />
      </MapContainer>
    </button>
  );
}
