import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { copy } from '../config/app.config';
import { pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import {
  approxDistanceM,
  completedVisits,
  totalTimeMs,
} from '../state/selectors';
import { formatDistance } from '../lib/geo';
import { formatDuration } from '../lib/time';
import { buildShareText } from '../lib/summary';
import { BigButton } from '../components/ui/BigButton';
import { RouteMap } from '../components/Map/RouteMap';
import { Screen } from '../components/ui/Screen';
import { Stat } from '../components/ui/Stat';

export function VictoryScreen() {
  const { state, dispatch } = useGame();
  // Finish time is fixed, so compute against finishedAt (totalTimeMs uses it).
  const now = state.finishedAt ?? Date.now();

  const visits = useMemo(() => completedVisits(state), [state]);
  // Visited pubs resolved to coordinates, in arrival order — the team's route.
  const route = useMemo(
    () =>
      visits
        .map((v) => pubs.find((p) => p.id === v.pubId))
        .filter((p): p is (typeof pubs)[number] => p !== undefined),
    [visits],
  );
  const [shared, setShared] = useState(false);

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
      title={copy.victory.heading}
      footer={
        <>
          <BigButton variant="success" onClick={share}>
            {shared ? copy.victory.shareCopied : copy.victory.shareCta}
          </BigButton>
          <div className="link-row">
            <Link to="/stats">{copy.victory.statsLink}</Link>
            <button
              className="link-button"
              onClick={() => dispatch({ type: 'RESUME_HUNT' })}
            >
              {copy.victory.resumeHuntCta}
            </button>
          </div>
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
      </div>

      {visits.length > 0 && (
        <div>
          <h2>{copy.victory.routeHeading}</h2>
          {route.length > 0 && (
            <div className="route-map-wrap">
              <RouteMap route={route} crumbs={state.breadcrumbs} />
            </div>
          )}
          <ol className="cheat-list">
            {visits.map((v) => (
              <li key={`${v.pubId}-${v.arrivedAt}`}>
                {pubs.find((p) => p.id === v.pubId)?.name ?? v.pubId}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Screen>
  );
}
