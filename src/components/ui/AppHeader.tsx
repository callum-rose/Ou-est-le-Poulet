import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../../config/app.config';
import { useGame } from '../../state/GameContext';
import { phaseOrder } from '../../state/routes';
import { challengeProgress, totalTimeMs } from '../../state/selectors';
import { formatDuration } from '../../lib/time';

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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.startedAt === null || state.finishedAt !== null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.startedAt, state.finishedAt]);

  const elapsedMs = state.startedAt !== null ? totalTimeMs(state, now) : null;

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

  // Progress (challenges + route) becomes reachable once the hunt is underway.
  const showProgressButton = state.startedAt !== null && pathname !== '/stats';
  const progress = challengeProgress(state);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__title" onClick={handleTitleTap}>
          {copy.appTitle}
        </span>
        {elapsedMs !== null && (
          <span className="app-header__timer" onClick={() => navigate('/stats')}>{formatDuration(elapsedMs)}</span>
        )}
        <div className="app-header__right">
          {showProgressButton && (
            <button
              className="app-header__progress-btn"
              onClick={() => navigate('/stats')}
              aria-label={copy.appHeader.progressAriaLabel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span className="app-header__progress-badge">
                {progress.done}/{progress.total}
              </span>
            </button>
          )}
          {showRulesButton && (
            <button
              className="app-header__rules-btn"
              onClick={() => navigate('/rules', { state: { fromNav: pathname } })}
              aria-label={copy.appHeader.rulesAriaLabel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          )}
          {teamName && <span className="app-header__team">{teamName}</span>}
        </div>
      </div>
    </header>
  );
}
