import { appConfig } from '../config/app.config';
import { travelChallenges } from '../config/data';
import type { GameAction, GameState, TravelVisit, Visit } from '../types';

export const initialState: GameState = {
  schemaVersion: appConfig.schemaVersion,
  phase: 'welcome',
  team: null,
  startedAt: null,
  finishedAt: null,
  visits: [],
  challengeCursor: 0,
  travelVisits: [],
  travelCursor: 0,
  introChallengeIndex: null,
  pendingPubId: null,
  breadcrumbs: [],
  geo: { status: 'unknown', last: null },
};

/** The single outstanding travel challenge, if one is in flight. */
export function activeTravelVisit(state: GameState): TravelVisit | undefined {
  return state.travelVisits.find((t) => t.completedAt === null);
}

/**
 * Whether the travel list could still hand out a challenge for this leg. False
 * on the opening leg when the flag is off (no pub visits yet ⇒ first leg) and
 * once the travel list is exhausted. This does *not* account for a challenge
 * already issued this leg — see {@link travelIssuedThisLeg}.
 */
export function travelAvailableForLeg(state: GameState): boolean {
  if (state.visits.length === 0 && !appConfig.travelChallengeOnFirstLeg) {
    return false;
  }
  return state.travelCursor < travelChallenges.length;
}

/**
 * Start of the current leg: the most recent completed pub arrival (legs are the
 * stretches between pub searches). 0 before any pub is searched.
 */
function currentLegStart(state: GameState): number {
  let start = 0;
  for (const v of state.visits) {
    if (v.completedAt !== null && v.completedAt > start) start = v.completedAt;
  }
  return start;
}

/**
 * Whether this leg has already been handed its one travel challenge — i.e. a
 * travel record (outstanding or done) was created since the last pub search.
 * Prevents re-issuing once the leg's challenge is completed but the team
 * lingers on the hunt screen / re-picks a pub.
 */
export function travelIssuedThisLeg(state: GameState): boolean {
  const start = currentLegStart(state);
  return state.travelVisits.some((t) => t.departedAt >= start);
}

/**
 * The travel challenge index this leg should surface, or null when none is
 * owed: the outstanding one if set off, else the next due one when the leg is
 * eligible and hasn't already been issued (and completed) one.
 */
export function pendingTravelChallengeIndex(state: GameState): number | null {
  const active = activeTravelVisit(state);
  if (active) return active.challengeIndex;
  if (!travelIssuedThisLeg(state) && travelAvailableForLeg(state)) {
    return state.travelCursor;
  }
  return null;
}

/** Most recent visit for a pub, if any. */
function lastVisitOf(state: GameState, pubId: string): Visit | undefined {
  for (let i = state.visits.length - 1; i >= 0; i--) {
    if (state.visits[i].pubId === pubId) return state.visits[i];
  }
  return undefined;
}

/** A pub is "searched" once a visit there has been completed. */
export function isPubCompleted(state: GameState, pubId: string): boolean {
  return state.visits.some((v) => v.pubId === pubId && v.completedAt !== null);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'BEGIN': {
      if (state.phase !== 'welcome') return state;
      return { ...state, phase: 'setup' };
    }

    case 'SET_TEAM_NAME': {
      const name = action.name.trim();
      if (!name) return state;
      // Naming the team during setup advances to the rules screen. If the team
      // navigates back to rename later, keep the current phase rather than
      // regressing.
      return {
        ...state,
        team: { name },
        phase: state.phase === 'setup' ? 'rules' : state.phase,
      };
    }

    case 'ACCEPT_RULES': {
      if (state.phase !== 'rules') return state;
      return { ...state, phase: 'ready' };
    }

    case 'START_GAME': {
      if (state.phase !== 'ready') return state;
      // Start the clock and drop straight into an opening challenge (no pub).
      // It consumes the cursor, so the first pub gets the next challenge. When
      // not looping, the cursor passes straight through: once it runs past the
      // list the index is out of range and no challenge is shown.
      const introChallengeIndex = action.loop
        ? state.challengeCursor % action.challengeCount
        : state.challengeCursor;
      return {
        ...state,
        phase: 'challenge',
        startedAt: action.at,
        introChallengeIndex,
        challengeCursor: state.challengeCursor + 1,
      };
    }

    case 'ARRIVE_AT_PUB': {
      // Allowed from hunting (first arrival) and arrival (re-picking a
      // different pub in the manual fallback).
      if (state.phase !== 'hunting' && state.phase !== 'arrival') return state;
      // Already searched? Caller routes to the "already searched" screen; we
      // simply stage the pending pub so screens can react, without a phase flip.
      if (isPubCompleted(state, action.pubId)) {
        return { ...state, pendingPubId: action.pubId };
      }
      return {
        ...state,
        phase: 'arrival',
        pendingPubId: action.pubId,
      };
    }

    case 'CANCEL_ARRIVAL': {
      if (state.phase !== 'arrival') return state;
      return { ...state, phase: 'hunting', pendingPubId: null };
    }

    case 'CONFIRM_PUB': {
      if (state.phase !== 'arrival' || state.pendingPubId === null) return state;
      const pubId = state.pendingPubId;

      // Guard against a double-confirm of an already-completed pub.
      if (isPubCompleted(state, pubId)) {
        return { ...state, phase: 'hunting', pendingPubId: null };
      }

      // Settle this leg's travel challenge before recording the pub. If one is
      // outstanding (they tapped "heading there" but never marked it done),
      // stamp it complete now. Otherwise, if the leg required one but they
      // skipped "heading there" entirely, record an already-complete one so the
      // leg's travel challenge is never silently dropped.
      const activeTravel = activeTravelVisit(state);
      let travelVisits = state.travelVisits;
      let travelCursor = state.travelCursor;
      if (activeTravel) {
        travelVisits = state.travelVisits.map((t) =>
          t === activeTravel ? { ...t, completedAt: action.at } : t,
        );
      } else if (!travelIssuedThisLeg(state) && travelAvailableForLeg(state)) {
        const travelVisit: TravelVisit = {
          challengeIndex: state.travelCursor,
          targetPubId: pubId,
          departedAt: action.at,
          completedAt: action.at,
        };
        travelVisits = [...state.travelVisits, travelVisit];
        travelCursor = state.travelCursor + 1;
      }

      // Not looping: the cursor passes straight through. Once it runs past the
      // list the index is out of range, so the pub is still searchable but
      // hands out no challenge.
      const challengeIndex = action.loop
        ? state.challengeCursor % action.challengeCount
        : state.challengeCursor;

      const visit: Visit = {
        pubId,
        challengeIndex,
        arrivedAt: action.at,
        completedAt: null,
      };

      return {
        ...state,
        phase: 'challenge',
        visits: [...state.visits, visit],
        challengeCursor: state.challengeCursor + 1,
        travelVisits,
        travelCursor,
      };
    }

    case 'OPEN_TRAVEL': {
      if (state.phase !== 'arrival' && state.phase !== 'hunting') return state;
      // Hand out this leg's travel challenge if it hasn't been already — whether
      // the team tapped "We're heading to ..." on arrival or the banner on the
      // hunt screen (so a forgotten depart tap still records the challenge).
      // When one is already outstanding, done, or not due, just navigate.
      if (
        activeTravelVisit(state) ||
        travelIssuedThisLeg(state) ||
        !travelAvailableForLeg(state)
      ) {
        return { ...state, phase: 'travel' };
      }
      // Keep pendingPubId (set on arrival) so the travel screen can name where
      // they're heading; it's null when opened from the hunt screen.
      const travelVisit: TravelVisit = {
        challengeIndex: state.travelCursor,
        targetPubId: state.pendingPubId,
        departedAt: action.at,
        completedAt: null,
      };
      return {
        ...state,
        phase: 'travel',
        travelVisits: [...state.travelVisits, travelVisit],
        travelCursor: state.travelCursor + 1,
      };
    }

    case 'COMPLETE_TRAVEL': {
      if (state.phase !== 'travel') return state;
      const travelVisits = [...state.travelVisits];
      for (let i = travelVisits.length - 1; i >= 0; i--) {
        if (travelVisits[i].completedAt === null) {
          travelVisits[i] = { ...travelVisits[i], completedAt: action.at };
          break;
        }
      }
      return { ...state, phase: 'hunting', pendingPubId: null, travelVisits };
    }

    case 'LEAVE_TRAVEL': {
      if (state.phase !== 'travel') return state;
      // Leave the challenge outstanding — they'll finish it on the walk and
      // mark it done from the banner (or be prompted again on arrival).
      return { ...state, phase: 'hunting', pendingPubId: null };
    }

    case 'COMPLETE_PUB': {
      if (state.phase !== 'challenge') return state;
      const visits = [...state.visits];
      // Complete the most recent open visit.
      for (let i = visits.length - 1; i >= 0; i--) {
        if (visits[i].completedAt === null) {
          visits[i] = { ...visits[i], completedAt: action.at };
          break;
        }
      }
      return {
        ...state,
        phase: 'hunting',
        pendingPubId: null,
        introChallengeIndex: null,
        visits,
      };
    }

    case 'FOUND_STAG': {
      if (state.phase === 'found') return state;
      return { ...state, phase: 'found', finishedAt: action.at };
    }

    case 'RESUME_HUNT': {
      if (state.phase !== 'found') return state;
      return { ...state, phase: 'hunting', finishedAt: null };
    }

    case 'PUSH_BREADCRUMB': {
      const crumb = action.crumb;
      const next = [...state.breadcrumbs, crumb];
      const trimmed =
        next.length > action.cap ? next.slice(next.length - action.cap) : next;
      return {
        ...state,
        breadcrumbs: trimmed,
        geo: { status: 'granted', last: crumb },
      };
    }

    case 'SET_GEO_STATUS': {
      return { ...state, geo: { ...state.geo, status: action.status } };
    }

    case 'RESET_GAME': {
      return { ...initialState };
    }

    default:
      return state;
  }
}

// Re-export for convenience.
export { lastVisitOf };
