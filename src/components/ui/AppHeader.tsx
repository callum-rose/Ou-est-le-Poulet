import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../../config/app.config';
import { useGame } from '../../state/GameContext';
import { phaseOrder } from '../../state/routes';
import { challengeProgress, totalTimeMs } from '../../state/selectors';
import { formatDuration } from '../../lib/time';

/** Tapping the team name this many times in quick succession opens the
 *  organiser cheat-sheet. */
const ORGANISER_TAPS = 3;
const TAP_RESET_MS = 2000;

export function AppHeader() {
  const { state } = useGame();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const teamName = state.team?.name;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (state.startedAt === null || state.finishedAt !== null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.startedAt, state.finishedAt]);

  // The cheat-sheet is the organiser overlay; while it's open the header icons
  // stay put but become inert so a press can't navigate the organiser away.
  const onCheatSheet = pathname === '/cheatsheet';

  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
  }, []);

  const handleTeamTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapCount.current += 1;
    if (tapCount.current >= ORGANISER_TAPS) {
      tapCount.current = 0;
      if (!onCheatSheet) navigate('/cheatsheet');
      return;
    }
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TAP_RESET_MS);
  };

  const elapsedMs = state.startedAt !== null ? totalTimeMs(state, now) : null;

  const showRulesButton =
    phaseOrder[state.phase] >= phaseOrder.rules && pathname !== '/rules';

  // Progress (challenges + route) becomes reachable once the hunt is underway.
  const showProgressButton = state.startedAt !== null && pathname !== '/stats';
  const progress = challengeProgress(state);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {teamName ? (
          <TeamName name={teamName} onTap={handleTeamTap} />
        ) : (
          <span className="app-header__spacer" />
        )}
        <div className="app-header__right">
          {elapsedMs !== null && (
            <span
              className="app-header__timer"
              onClick={() => {
                if (!onCheatSheet) navigate('/stats');
              }}
            >
              {formatDuration(elapsedMs)}
            </span>
          )}
          {showRulesButton && (
            <button
              className="app-header__rules-btn"
              onClick={() => {
                if (!onCheatSheet)
                  navigate('/rules', { state: { fromNav: pathname } });
              }}
              aria-label={copy.appHeader.rulesAriaLabel}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          )}
          {showProgressButton && (
            <button
              className="app-header__progress-btn"
              onClick={() => {
                if (!onCheatSheet) navigate('/stats');
              }}
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
        </div>
      </div>
    </header>
  );
}

/**
 * The current team name. It wraps to at most two lines; once a name is long
 * enough to need a third line we collapse it back onto a single line and scroll
 * it horizontally so the whole name stays readable.
 */
function TeamName({ name, onTap }: { name: string; onTap: () => void }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const [marquee, setMarquee] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track) return;

    const measure = () => {
      // Measure the wrapped height with any marquee styling stripped, so the
      // result never depends on the mode we're currently in.
      track.style.display = 'block';
      track.style.whiteSpace = 'normal';
      track.style.transform = 'none';
      const lineHeight = parseFloat(getComputedStyle(track).lineHeight) || 1;
      const lines = Math.round(track.scrollHeight / lineHeight);
      const overflows = lines > 2;

      let distance = 0;
      if (overflows) {
        // How far the name overflows its box when forced onto one line.
        track.style.whiteSpace = 'nowrap';
        distance = track.scrollWidth - box.clientWidth;
      }

      track.style.display = '';
      track.style.whiteSpace = '';
      track.style.transform = '';

      setScrollDistance(distance > 0 ? distance : 0);
      setMarquee(overflows);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [name]);

  // Keep the scroll speed roughly constant regardless of the name's length.
  const trackStyle = marquee
    ? ({
        '--team-scroll': `${-scrollDistance}px`,
        animationDuration: `${Math.max(4, scrollDistance / 30)}s`,
      } as CSSProperties)
    : undefined;

  return (
    <span
      ref={boxRef}
      className={`app-header__team${marquee ? ' app-header__team--marquee' : ''}`}
      onClick={onTap}
    >
      <span ref={trackRef} className="app-header__team-track" style={trackStyle}>
        {name}
      </span>
    </span>
  );
}
