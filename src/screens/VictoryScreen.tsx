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
import { Screen } from '../components/ui/Screen';
import { Stat } from '../components/ui/Stat';

export function VictoryScreen() {
  const { state } = useGame();
  // Finish time is fixed, so compute against finishedAt (totalTimeMs uses it).
  const now = state.finishedAt ?? Date.now();

  const visits = useMemo(() => completedVisits(state), [state]);
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
      subtitle={state.team ? state.team.name : undefined}
      footer={
        <>
          <BigButton variant="success" onClick={share}>
            {shared ? copy.victory.shareCopied : copy.victory.shareCta}
          </BigButton>
          <div className="link-row">
            <Link to="/stats">Full stats</Link>
          </div>
        </>
      }
    >
      <div className="stat-grid">
        <Stat value={formatDuration(totalTimeMs(state, now))} label="Total time" />
        <Stat value={String(visits.length)} label="Pubs searched" />
        <Stat
          value={formatDistance(approxDistanceM(state))}
          label="Approx distance"
        />
      </div>

      {visits.length > 0 && (
        <div>
          <h2>Your route</h2>
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
