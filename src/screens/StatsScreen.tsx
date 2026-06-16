import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import {
  approxDistanceM,
  challengeProgress,
  completedVisits,
  progressTimeline,
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
  const progress = useMemo(() => challengeProgress(state), [state]);
  const timeline = useMemo(() => progressTimeline(state), [state]);
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
      <div className="progress-banner">
        <div className="progress-banner__count">
          {progress.done} of {progress.total} {copy.stats.challengesDoneLabel}
        </div>
        <p className="progress-banner__message">
          {progress.remaining > 0
            ? copy.stats.nextChallengeMessage
            : copy.stats.allChallengesDone}
        </p>
      </div>

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

      {timeline.length > 0 && (
        <div>
          <h2>{copy.stats.pubsInOrderHeading}</h2>
          <ol className="timeline">
            {timeline.map((stop, i) => {
              const name = stop.pubId
                ? pubs.find((p) => p.id === stop.pubId)?.name ?? stop.pubId
                : copy.stats.introStopLabel;
              const challenge =
                stop.challengeIndex !== null ? challenges[stop.challengeIndex] : undefined;
              const dwell =
                stop.arrivedAt !== null && stop.completedAt !== null && stop.pubId
                  ? stop.completedAt - stop.arrivedAt
                  : null;
              return (
                <li
                  className="timeline__item"
                  key={`${stop.pubId ?? 'intro'}-${stop.arrivedAt ?? i}`}
                >
                  <time className="timeline__time">
                    {stop.arrivedAt !== null ? formatClock(stop.arrivedAt) : ''}
                  </time>
                  <div className="timeline__body">
                    <div className="timeline__head">
                      <strong className="timeline__name">{name}</strong>
                      {dwell !== null && (
                        <span className="timeline__dwell">
                          {copy.stats.dwellLabel} {formatDuration(dwell)}
                        </span>
                      )}
                    </div>
                    {challenge ? (
                      <div className="challenge-done">
                        <span className="challenge-done__title">{challenge.title}</span>
                        <span className="challenge-done__desc">{challenge.description}</span>
                      </div>
                    ) : (
                      <div className="challenge-done challenge-done--none">
                        {copy.stats.noChallengeLabel}
                      </div>
                    )}
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
