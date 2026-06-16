import type { GamePhase } from '../types';

/** Canonical route for each game phase (PhaseGate drives navigation). */
export const routeForPhase: Record<GamePhase, string> = {
  setup: '/',
  ready: '/ready',
  hunting: '/hunt',
  arrival: '/arrival',
  challenge: '/challenge',
  found: '/victory',
};

/** Routes that are exempt from phase-driven redirects. */
export const PHASE_EXEMPT_ROUTES = ['/stats', '/cheatsheet'];
