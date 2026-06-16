import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copy } from '../config/app.config';
import { pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import {
  approxDistanceM,
  completedVisits,
  dwellMs,
  totalTimeMs,
} from '../state/selectors';
import { clearState } from '../state/persistence';
import { formatDistance } from '../lib/geo';
import { formatClock, formatDuration } from '../lib/time';
import { BigButton } from '../components/ui/BigButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Screen } from '../components/ui/Screen';
import { Stat } from '../components/ui/Stat';

export function StatsScreen() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  // Tick once a second to keep the live total time fresh (until finished).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (state.finishedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [state.finishedAt]);

  const visits = useMemo(() => completedVisits(state), [state]);
  const [confirmReset, setConfirmReset] = useState(false);

  const reset = () => {
    clearState();
    dispatch({ type: 'RESET_GAME' });
    setConfirmReset(false);
    navigate('/', { replace: true });
  };

  return (
    <Screen
      title={copy.stats.heading}
      subtitle={state.team ? state.team.name : undefined}
      footer={
        <>
          <BigButton variant="secondary" onClick={() => navigate(-1)}>
            {copy.stats.backCta}
          </BigButton>
          {/* Hidden reset: ghost styling + confirm gate so it isn't a fat-
              finger hazard mid-game. */}
          <BigButton variant="ghost" onClick={() => setConfirmReset(true)}>
            {copy.stats.resetCta}
          </BigButton>
        </>
      }
    >
      <div className="stat-grid">
        <Stat value={formatDuration(totalTimeMs(state, now))} label={copy.statLabels.totalTime} />
        <Stat value={String(visits.length)} label={copy.statLabels.pubsSearched} />
        <Stat
          value={formatDistance(approxDistanceM(state))}
          label={copy.statLabels.approxDistance}
        />
        <Stat value={String(state.breadcrumbs.length)} label={copy.statLabels.gpsSamples} />
      </div>
      <p className="muted">{copy.stats.distanceDisclaimer}</p>

      {visits.length > 0 && (
        <div>
          <h2>{copy.stats.pubsInOrderHeading}</h2>
          <ol className="cheat-list">
            {visits.map((v) => {
              const name = pubs.find((p) => p.id === v.pubId)?.name ?? v.pubId;
              return (
                <li key={`${v.pubId}-${v.arrivedAt}`}>
                  <strong>{name}</strong>
                  <div className="muted" style={{ fontSize: 14 }}>
                    {formatClock(v.arrivedAt)} · {copy.stats.dwellLabel} {formatDuration(dwellMs(v))}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {confirmReset && (
        <ConfirmDialog
          message={copy.stats.resetConfirm}
          confirmLabel={copy.stats.resetConfirmCta}
          cancelLabel={copy.stats.resetCancel}
          confirmVariant="danger"
          onConfirm={reset}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </Screen>
  );
}
