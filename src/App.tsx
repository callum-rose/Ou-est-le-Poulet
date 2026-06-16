import { useEffect, useRef } from 'react';
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { GameProvider, useGame } from './state/GameContext';
import {
  canViewRoute,
  PHASE_EXEMPT_ROUTES,
  phaseForRoute,
  phaseOrder,
  routeForPhase,
} from './state/routes';
import { AppHeader } from './components/ui/AppHeader';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { RulesScreen } from './screens/RulesScreen';
import { ReadyScreen } from './screens/ReadyScreen';
import { HuntScreen } from './screens/HuntScreen';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { StatsScreen } from './screens/StatsScreen';
import { CheatSheetScreen } from './screens/CheatSheetScreen';

/**
 * Keeps the URL/history and the game phase in sync so the browser Back and
 * Forward buttons move between in-app screens instead of leaving the site.
 *
 *  - A phase change from a game action navigates to the phase's canonical
 *    route, pushing a history entry when the phase advances (so Back can
 *    return) and replacing it when the phase retreats (cancel/loop-back), to
 *    keep stale forward entries out of the stack.
 *  - A navigation that did not come from a phase change (Back/Forward, deep
 *    link) is allowed only when it lands on a stable earlier screen; anything
 *    ahead of the current phase, or a transient screen out of phase, is
 *    snapped back to the canonical route, preserving the phase guard.
 *  - On the arrival screen the hardware Back button is translated into a real
 *    CANCEL_ARRIVAL so the phase follows the URL back to hunting.
 *  - The first run reconciles a resumed/deep-linked session to its canonical
 *    route, so it owns the single initial history entry.
 *
 * Stats and the cheat-sheet are exempt overlays.
 */
function PhaseGate() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const firstRun = useRef(true);
  const prevPhase = useRef(state.phase);

  useEffect(() => {
    if (PHASE_EXEMPT_ROUTES.includes(pathname)) return;

    const phase = state.phase;
    const target = routeForPhase[phase];
    const phaseChanged = prevPhase.current !== phase;
    prevPhase.current = phase;

    // Cold start: own the initial history entry with the canonical route.
    if (firstRun.current) {
      firstRun.current = false;
      if (pathname !== target) navigate(target, { replace: true });
      return;
    }

    if (pathname === target) return;

    if (phaseChanged) {
      // A game action moved the phase. Push when moving forward (so Back can
      // return to the previous screen); replace on a retreat so the abandoned
      // screen isn't left dangling ahead of us in history. An unknown current
      // route (rank -1) counts as behind everything, so it's a forward push.
      const fromPhase = phaseForRoute[pathname];
      const fromRank = fromPhase === undefined ? -1 : phaseOrder[fromPhase];
      const replace = phaseOrder[phase] <= fromRank;
      navigate(target, { replace });
      return;
    }

    // Navigation event (Back/Forward/deep link), phase unchanged.

    // Hardware Back off the arrival screen = cancel the arrival.
    if (phase === 'arrival' && pathname === routeForPhase.hunting) {
      dispatch({ type: 'CANCEL_ARRIVAL' });
      return;
    }

    // Allow stepping back to a stable earlier screen; otherwise snap forward
    // to the canonical route (rejects deep links ahead of the phase and
    // re-entry into transient screens).
    if (canViewRoute(pathname, phase)) return;
    navigate(target, { replace: true });
  }, [state.phase, pathname, navigate, dispatch]);

  return null;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <PhaseGate />
      <AppHeader />
      {/* Keyed wrapper replays the enter animation on every route change.
          The animation reverts to no transform at rest, so it never becomes a
          containing block for the fixed-position dialogs the screens render. */}
      <div className="screen-transition" key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/team" element={<SetupScreen />} />
          <Route path="/rules" element={<RulesScreen />} />
          <Route path="/ready" element={<ReadyScreen />} />
          <Route path="/hunt" element={<HuntScreen />} />
          <Route path="/arrival" element={<ArrivalScreen />} />
          <Route path="/challenge" element={<ChallengeScreen />} />
          <Route path="/victory" element={<VictoryScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/cheatsheet" element={<CheatSheetScreen />} />
          {/* Unknown paths fall through to welcome; PhaseGate then corrects. */}
          <Route path="*" element={<WelcomeScreen />} />
        </Routes>
      </div>
    </>
  );
}

export function App() {
  return (
    <GameProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </GameProvider>
  );
}
