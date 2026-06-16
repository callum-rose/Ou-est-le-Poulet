import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../../config/app.config';
import { useGame } from '../../state/GameContext';
import { phaseOrder } from '../../state/routes';

const ORGANISER_TAPS = 3;
const TAP_RESET_MS = 2000;

/**
 * Global header shown on every screen: the website title, plus the current
 * team name once one has been chosen. Tapping the title three times in quick
 * succession opens the organiser cheat-sheet.
 */
export function AppHeader() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const teamName = state.team?.name;
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTitleTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapCount.current += 1;
    if (tapCount.current >= ORGANISER_TAPS) {
      tapCount.current = 0;
      navigate('/cheatsheet');
      return;
    }
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TAP_RESET_MS);
  };

  const showRulesButton =
    phaseOrder[state.phase] >= phaseOrder.rules && pathname !== '/rules';

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__title" onClick={handleTitleTap}>
          {copy.appTitle}
        </span>
        <div className="app-header__right">
          {showRulesButton && (
            <button
              className="app-header__rules-btn"
              onClick={() => navigate('/rules', { state: { fromNav: pathname } })}
            >
              Rules
            </button>
          )}
          {teamName && <span className="app-header__team">{teamName}</span>}
        </div>
      </div>
    </header>
  );
}
