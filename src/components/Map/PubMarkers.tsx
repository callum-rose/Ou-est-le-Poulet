import { divIcon } from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';
import type { Pub } from '../../types';

// divIcon avoids the bundled-asset icon bug entirely (no image URLs).
function pinIcon(visited: boolean) {
  return divIcon({
    className: '',
    html: `<div class="pub-pin pub-pin--${visited ? 'visited' : 'unvisited'}"></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
    tooltipAnchor: [12, -12],
  });
}

const unvisitedIcon = pinIcon(false);
const visitedIcon = pinIcon(true);

interface PubMarkersProps {
  pubs: readonly Pub[];
  visitedIds: Set<string>;
  onSelect?: (pubId: string) => void;
}

export function PubMarkers({ pubs, visitedIds, onSelect }: PubMarkersProps) {
  return (
    <>
      {pubs.map((pub) => {
        const visited = visitedIds.has(pub.id);
        return (
          <Marker
            key={pub.id}
            position={[pub.lat, pub.lng]}
            icon={visited ? visitedIcon : unvisitedIcon}
            eventHandlers={
              onSelect ? { click: () => onSelect(pub.id) } : undefined
            }
          >
            <Tooltip
              permanent
              direction="right"
              offset={[10, -8]}
              className={onSelect ? 'pub-tooltip--clickable' : undefined}
            >
              {onSelect ? (
                <span onClick={() => onSelect(pub.id)}>{pub.name}</span>
              ) : (
                pub.name
              )}
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
}
