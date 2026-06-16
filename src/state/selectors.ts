import { trailDistanceM } from '../lib/geo';
import { challenges } from '../config/data';
import type { GameState, Visit } from '../types';

/**
 * The intro challenge is always the first in the list (the cursor starts at 0),
 * but its index is cleared from state once completed, so we re-derive it here.
 */
const INTRO_CHALLENGE_INDEX = 0;

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

/** True once the pre-hunt intro challenge has been shown and completed. */
export function introChallengeDone(state: GameState): boolean {
  return state.startedAt !== null && state.introChallengeIndex === null;
}

/** Whether a challenge index points at a real (non-exhausted) challenge. */
function isRealChallenge(index: number | null | undefined): index is number {
  return index !== null && index !== undefined && index < challenges.length;
}

/** Challenge completion progress: how many of the finite set are done. */
export function challengeProgress(state: GameState): {
  done: number;
  total: number;
  remaining: number;
} {
  const total = challenges.length;
  let done = introChallengeDone(state) ? 1 : 0;
  for (const v of completedVisits(state)) {
    if (isRealChallenge(v.challengeIndex)) done += 1;
  }
  // Clamp in case data shrinks under an older save.
  done = Math.min(done, total);
  return { done, total, remaining: Math.max(0, total - done) };
}

/** A single stop on the unified progress timeline. */
export interface ProgressStop {
  /** Null for the intro challenge, which has no pub. */
  pubId: string | null;
  /** Null when this stop handed out no challenge (list exhausted). */
  challengeIndex: number | null;
  arrivedAt: number | null;
  completedAt: number | null;
}

/**
 * The team's route as an ordered timeline: the intro challenge first (when
 * done), then every completed pub visit. Out-of-range challenge indices become
 * null so callers can render the stop without a challenge.
 */
export function progressTimeline(state: GameState): ProgressStop[] {
  const stops: ProgressStop[] = [];
  if (introChallengeDone(state)) {
    stops.push({
      pubId: null,
      challengeIndex: isRealChallenge(INTRO_CHALLENGE_INDEX)
        ? INTRO_CHALLENGE_INDEX
        : null,
      arrivedAt: state.startedAt,
      completedAt: state.startedAt,
    });
  }
  for (const v of completedVisits(state)) {
    stops.push({
      pubId: v.pubId,
      challengeIndex: isRealChallenge(v.challengeIndex) ? v.challengeIndex : null,
      arrivedAt: v.arrivedAt,
      completedAt: v.completedAt,
    });
  }
  return stops;
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
