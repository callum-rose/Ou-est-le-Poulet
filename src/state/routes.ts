import type { GamePhase } from '../types';

/** Canonical route for each game phase (PhaseGate drives navigation). */
export const routeForPhase: Record<GamePhase, string> = {
  welcome: '/',
  setup: '/team',
  rules: '/rules',
  ready: '/ready',
  hunting: '/hunt',
  arrival: '/arrival',
  travel: '/travel',
  challenge: '/challenge',
  // The stats screen doubles as the terminal victory screen. It's an exempt
  // overlay, so PhaseGate won't drive navigation to/from it — the found-phase
  // screen navigates explicitly (resume → /hunt, reset → /).
  found: '/stats',
};

/** Reverse lookup: which phase a route belongs to (undefined for overlays). */
export const phaseForRoute: Record<string, GamePhase> = Object.fromEntries(
  Object.entries(routeForPhase).map(([phase, route]) => [route, phase]),
) as Record<string, GamePhase>;

/**
 * Progression rank of each phase. Used to decide whether a navigation moves
 * forward (push a history entry) or backward (replace), and to reject deep
 * links that jump ahead of the current phase.
 */
export const phaseOrder: Record<GamePhase, number> = {
  welcome: 0,
  setup: 1,
  rules: 2,
  ready: 3,
  hunting: 4,
  arrival: 5,
  travel: 6,
  challenge: 7,
  found: 8,
};

/**
 * Stable screens the browser Back button may return to. The transient loop
 * screens (arrival, travel, challenge) and the terminal victory screen are
 * excluded — you can't wander back into them once the phase has moved on.
 */
export const BACK_NAVIGABLE_PHASES: GamePhase[] = [
  'welcome',
  'setup',
  'rules',
  'ready',
  'hunting',
];

/** Routes that are exempt from phase-driven redirects. */
export const PHASE_EXEMPT_ROUTES = ['/stats', '/cheatsheet'];

/**
 * Whether the user is allowed to *view* a route while in a given phase via
 * back/forward, without PhaseGate snapping them back to the canonical route.
 * True only for stable earlier screens at or behind the current phase.
 */
export function canViewRoute(pathname: string, phase: GamePhase): boolean {
  const viewed = phaseForRoute[pathname];
  if (!viewed || !BACK_NAVIGABLE_PHASES.includes(viewed)) return false;
  return phaseOrder[viewed] <= phaseOrder[phase];
}
