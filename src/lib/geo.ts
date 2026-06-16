import type { Breadcrumb, Pub } from '../types';

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two lat/lng points, in metres. */
export function haversineM(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface NearestPub {
  pub: Pub;
  distanceM: number;
}

/** Nearest pub to a position, or null if there are no pubs. */
export function nearestPub(
  lat: number,
  lng: number,
  pubs: readonly Pub[],
): NearestPub | null {
  let best: NearestPub | null = null;
  for (const pub of pubs) {
    const distanceM = haversineM(lat, lng, pub.lat, pub.lng);
    if (best === null || distanceM < best.distanceM) {
      best = { pub, distanceM };
    }
  }
  return best;
}

/** Summed straight-line distance along an ordered breadcrumb trail, in metres. */
export function trailDistanceM(crumbs: readonly Breadcrumb[]): number {
  let total = 0;
  for (let i = 1; i < crumbs.length; i++) {
    const a = crumbs[i - 1];
    const b = crumbs[i];
    total += haversineM(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

/** Human-readable distance: metres under 1km, otherwise one-decimal km. */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
}
