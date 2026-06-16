import { useMemo } from 'react';
import { nearestPub, type NearestPub } from '../lib/geo';
import type { Breadcrumb, Pub } from '../types';

/** Nearest pub to the latest fix, with whether it's within the arrival radius. */
export function useNearestPub(
  last: Breadcrumb | null,
  pubs: readonly Pub[],
  radiusM: number,
): { nearest: NearestPub | null; withinRadius: boolean } {
  return useMemo(() => {
    if (!last) return { nearest: null, withinRadius: false };
    const nearest = nearestPub(last.lat, last.lng, pubs);
    return {
      nearest,
      withinRadius: nearest !== null && nearest.distanceM <= radiusM,
    };
  }, [last, pubs, radiusM]);
}
