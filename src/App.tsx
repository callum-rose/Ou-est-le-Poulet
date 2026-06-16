import { useEffect } from 'react';
import {
  HashRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { GameProvider, useGame } from './state/GameContext';
import { PHASE_EXEMPT_ROUTES, routeForPhase } from './state/routes';
import { AppHeader } from './components/ui/AppHeader';
import { SetupScreen } from './screens/SetupScreen';
import { ReadyScreen } from './screens/ReadyScreen';
import { HuntScreen } from './screens/HuntScreen';
import { ArrivalScreen } from './screens/ArrivalScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { VictoryScreen } from './screens/VictoryScreen';
import { StatsScreen } from './screens/StatsScreen';
import { CheatSheetScreen } from './screens/CheatSheetScreen';

/**
 * Routing is driven by game phase, not the URL. On any mismatch (e.g. reopening
 * a deep link, or a phase transition), snap to the phase's canonical route.
 * Stats and the cheat-sheet are exempt overlays.
 */
function PhaseGate() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (PHASE_EXEMPT_ROUTES.includes(pathname)) return;
    const target = routeForPhase[state.phase];
    if (pathname !== target) {
      navigate(target, { replace: true });
    }
  }, [state.phase, pathname, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <PhaseGate />
      <AppHeader />
      <Routes>
        <Route path="/" element={<SetupScreen />} />
        <Route path="/ready" element={<ReadyScreen />} />
        <Route path="/hunt" element={<HuntScreen />} />
        <Route path="/arrival" element={<ArrivalScreen />} />
        <Route path="/challenge" element={<ChallengeScreen />} />
        <Route path="/victory" element={<VictoryScreen />} />
        <Route path="/stats" element={<StatsScreen />} />
        <Route path="/cheatsheet" element={<CheatSheetScreen />} />
        {/* Unknown paths fall through to setup; PhaseGate then corrects. */}
        <Route path="*" element={<SetupScreen />} />
      </Routes>
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
