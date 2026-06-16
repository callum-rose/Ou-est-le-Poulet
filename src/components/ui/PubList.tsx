import { formatDistance } from '../../lib/geo';
import type { Pub } from '../../types';

interface PubListProps {
  pubs: readonly Pub[];
  visitedIds: Set<string>;
  /** Pub id to highlight as the GPS suggestion. */
  suggestedId?: string | null;
  /** Distances by pub id (metres), for an optional badge. */
  distancesM?: Record<string, number>;
  /** Disable already-visited pubs from being tapped. */
  disableVisited?: boolean;
  onSelect: (pubId: string) => void;
}

export function PubList({
  pubs,
  visitedIds,
  suggestedId,
  distancesM,
  disableVisited = false,
  onSelect,
}: PubListProps) {
  const sorted = [...pubs].sort((a, b) => {
    const aVisited = visitedIds.has(a.id) ? 1 : 0;
    const bVisited = visitedIds.has(b.id) ? 1 : 0;
    return aVisited - bVisited;
  });

  return (
    <ul className="pub-list">
      {sorted.map((pub) => {
        const visited = visitedIds.has(pub.id);
        const suggested = suggestedId === pub.id;
        const dist = distancesM?.[pub.id];
        const disabled = disableVisited && visited;

        const classes = [
          'pub-list__item',
          visited ? 'pub-list__item--visited' : '',
          suggested ? 'pub-list__item--suggested' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <li key={pub.id}>
            <button
              className={classes}
              onClick={() => onSelect(pub.id)}
              disabled={disabled}
            >
              <span className="pub-list__name">
                {pub.name}
                {pub.phonetic && (
                  <span className="pub-list__phonetic">{pub.phonetic}</span>
                )}
              </span>
              <span
                className={`pub-list__badge ${
                  suggested ? 'pub-list__badge--suggested' : ''
                }`}
              >
                {visited
                  ? '✓ searched'
                  : suggested
                    ? 'nearest'
                    : dist != null
                      ? formatDistance(dist)
                      : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
