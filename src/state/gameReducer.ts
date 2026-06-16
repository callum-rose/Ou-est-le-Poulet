import { appConfig } from '../config/app.config';
import type { GameAction, GameState, Visit } from '../types';

export const initialState: GameState = {
  schemaVersion: appConfig.schemaVersion,
  phase: 'setup',
  team: null,
  startedAt: null,
  finishedAt: null,
  visits: [],
  challengeCursor: 0,
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
    case 'SET_TEAM_NAME': {
      const name = action.name.trim();
      if (!name) return state;
      return { ...state, team: { name }, phase: 'ready' };
    }

    case 'START_GAME': {
      if (state.phase !== 'ready') return state;
      return { ...state, phase: 'hunting', startedAt: action.at };
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

      const challengeIndex = action.loop
        ? state.challengeCursor % action.challengeCount
        : Math.min(state.challengeCursor, action.challengeCount - 1);

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
      return { ...state, phase: 'hunting', pendingPubId: null, visits };
    }

    case 'FOUND_STAG': {
      if (state.phase === 'found') return state;
      return { ...state, phase: 'found', finishedAt: action.at };
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
