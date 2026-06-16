import { appConfig } from '../config/app.config';
import type { GameAction, GameState, Visit } from '../types';

export const initialState: GameState = {
  schemaVersion: appConfig.schemaVersion,
  phase: 'welcome',
  team: null,
  startedAt: null,
  finishedAt: null,
  visits: [],
  challengeCursor: 0,
  introChallengeIndex: null,
  pendingPubId: null,
  breadcrumbs: [],
  geo: { status: 'unknown', last: null },
};

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
      };
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
