import { trailDistanceM } from '../lib/geo';
import type { GameState, Visit } from '../types';

/** Set of pub ids the team has fully searched (completed a challenge at). */
export function visitedPubIds(state: GameState): Set<string> {
  const ids = new Set<string>();
  for (const v of state.visits) {
    if (v.completedAt !== null) ids.add(v.pubId);
  }
  return ids;
}

/** Completed visits in arrival order — the team's route. */
export function completedVisits(state: GameState): Visit[] {
  return state.visits.filter((v) => v.completedAt !== null);
}

/** Number of distinct pubs searched. */
export function pubsVisitedCount(state: GameState): number {
  return visitedPubIds(state).size;
}

/** Dwell time at a single visit, in ms (0 if still open). */
export function dwellMs(visit: Visit): number {
  if (visit.completedAt === null) return 0;
  return visit.completedAt - visit.arrivedAt;
}

/** Total elapsed game time in ms (live until finished). */
export function totalTimeMs(state: GameState, now: number): number {
  if (state.startedAt === null) return 0;
  const end = state.finishedAt ?? now;
  return end - state.startedAt;
}

/** Approximate distance walked, summed from breadcrumbs (metres). */
export function approxDistanceM(state: GameState): number {
  return trailDistanceM(state.breadcrumbs);
}
