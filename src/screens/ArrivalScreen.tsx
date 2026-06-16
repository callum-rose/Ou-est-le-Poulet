import { useMemo, useState } from 'react';
import { appConfig, copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { isPubCompleted } from '../state/gameReducer';
import { visitedPubIds } from '../state/selectors';
import { haversineM } from '../lib/geo';
import { useNearestPub } from '../hooks/useNearestPub';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { PubList } from '../components/ui/PubList';
import { Screen } from '../components/ui/Screen';
import { AlreadySearchedScreen } from './AlreadySearchedScreen';

export function ArrivalScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  const visited = useMemo(() => visitedPubIds(state), [state]);
  const last = state.geo.last;
  const { nearest } = useNearestPub(last, pubs, appConfig.arrivalRadiusM);

  // The pub the team is currently considering: the one they tapped, falling
  // back to the GPS-nearest suggestion.
  const pending = state.pendingPubId
    ? (pubs.find((p) => p.id === state.pendingPubId) ?? null)
    : (nearest?.pub ?? null);

  const distances = useMemo(() => {
    if (!last) return undefined;
    const out: Record<string, number> = {};
    for (const p of pubs) out[p.id] = haversineM(last.lat, last.lng, p.lat, p.lng);
    return out;
  }, [last]);

  const [showPicker, setShowPicker] = useState(state.pendingPubId === null);

  const confirm = () => {
    void sample();
    dispatch({
      type: 'CONFIRM_PUB',
      at: Date.now(),
      challengeCount: challenges.length,
      loop: appConfig.loopChallenges,
    });
  };

  const pickPub = (pubId: string) => {
    if (isPubCompleted(state, pubId)) return; // disabled in list anyway
    dispatch({ type: 'ARRIVE_AT_PUB', pubId, at: Date.now() });
    setShowPicker(false);
  };

  // Edge case: the staged pub was already searched (e.g. tapped on map mid-
  // arrival). Surface the revisit message instead of letting them confirm.
  if (pending && isPubCompleted(state, pending.id)) {
    return (
      <AlreadySearchedScreen
        pubId={pending.id}
        onBack={() => dispatch({ type: 'CANCEL_ARRIVAL' })}
      />
    );
  }

  return (
    <Screen
      title={copy.arrival.heading}
      footer={
        <BigButton
          variant="ghost"
          onClick={() => dispatch({ type: 'CANCEL_ARRIVAL' })}
        >
          {copy.arrival.cancel}
        </BigButton>
      }
    >
      {pending && !showPicker ? (
        <>
          <p>
            {copy.arrival.suggestPrefix} <strong>{pending.name}</strong>.
          </p>
          <BigButton variant="success" onClick={confirm}>
            {copy.arrival.confirmCta}
          </BigButton>
          <BigButton variant="secondary" onClick={() => setShowPicker(true)}>
            {copy.arrival.pickOther}
          </BigButton>
        </>
      ) : (
        <>
          <p className="muted">{copy.arrival.noSuggestion}</p>
          {/* Manual fallback is ALWAYS available so a bad/denied fix never
              blocks progress. */}
          <PubList
            pubs={pubs}
            visitedIds={visited}
            suggestedId={nearest?.pub.id ?? null}
            distancesM={distances}
            disableVisited
            onSelect={pickPub}
          />
        </>
      )}
    </Screen>
  );
}
