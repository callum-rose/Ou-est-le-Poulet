import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copy } from '../config/app.config';
import { challenges, pubs, travelChallenges } from '../config/data';
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
import { buildShareText } from '../lib/summary';
import { BigButton } from '../components/ui/BigButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { RouteMap } from '../components/Map/RouteMap';
import { Screen } from '../components/ui/Screen';
import { Stat } from '../components/ui/Stat';

export function StatsScreen() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();

  // Once the stag is found this screen doubles as the victory screen: same
  // rich stats, but different heading and footer actions.
  const finished = state.finishedAt !== null;

  // Tick once a second to keep the live total time fresh (until finished).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const visits = useMemo(() => completedVisits(state), [state]);
  // Visited pubs resolved to coordinates, in arrival order — the team's route.
  const route = useMemo(
    () =>
      visits
        .map((v) => pubs.find((p) => p.id === v.pubId))
        .filter((p): p is (typeof pubs)[number] => p !== undefined),
    [visits],
  );
  const progress = useMemo(() => challengeProgress(state), [state]);
  const timeline = useMemo(() => progressTimeline(state), [state]);
  const [confirmReset, setConfirmReset] = useState(false);
  const [shared, setShared] = useState(false);

  const reset = () => {
    clearState();
    dispatch({ type: 'RESET_GAME' });
    setConfirmReset(false);
    navigate('/', { replace: true });
  };

  // PhaseGate ignores the exempt /stats route, so resuming the hunt has to
  // drive navigation itself.
  const resumeHunt = () => {
    dispatch({ type: 'RESUME_HUNT' });
    navigate('/hunt');
  };

  const share = async () => {
    const text = buildShareText(state, now);
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // User cancelled the share sheet, or clipboard blocked — no-op.
    }
  };

  return (
    <Screen
      title={finished ? copy.stats.victoryHeading : copy.stats.heading}
      footer={
        finished ? (
          <>
            <BigButton variant="success" onClick={share}>
              {shared ? copy.stats.shareCopied : copy.stats.shareCta}
            </BigButton>
            <div className="link-row">
              <button className="link-button" onClick={resumeHunt}>
                {copy.stats.resumeHuntCta}
              </button>
              <button
                className="link-button"
                onClick={() => setConfirmReset(true)}
              >
                {copy.stats.resetCta}
              </button>
            </div>
          </>
        ) : (
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
        )
      }
    >
      <div className="progress-banner">
        <div className="progress-banner__count">
          {progress.done} of {progress.total} {copy.stats.challengesDoneLabel}
        </div>
        <p className="progress-banner__message">
          {finished
            ? copy.stats.finishedMessage
            : progress.remaining > 0
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
      </div>

      {state.startedAt !== null && (
        <div>
          <h2>{copy.stats.pubsInOrderHeading}</h2>
          {route.length > 0 && (
            <div className="route-map-wrap">
              <RouteMap route={route} crumbs={state.breadcrumbs} />
            </div>
          )}

          {timeline.length > 0 && (
            <ol className="timeline">
              {timeline.map((stop, i) => {
                const name =
                  stop.kind === 'pub'
                    ? pubs.find((p) => p.id === stop.pubId)?.name ?? stop.pubId
                    : stop.kind === 'travel'
                      ? copy.stats.travelStopLabel
                      : copy.stats.introStopLabel;
                const list =
                  stop.kind === 'travel' ? travelChallenges : challenges;
                const challenge =
                  stop.challengeIndex !== null ? list[stop.challengeIndex] : undefined;
                const dwell =
                  stop.arrivedAt !== null && stop.completedAt !== null && stop.pubId
                    ? stop.completedAt - stop.arrivedAt
                    : null;
                return (
                  <li
                    className="timeline__item"
                    key={`${stop.kind}-${stop.arrivedAt ?? i}`}
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
          )}
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
