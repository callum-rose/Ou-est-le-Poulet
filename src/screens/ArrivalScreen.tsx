import { appConfig, copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { isPubCompleted } from '../state/gameReducer';
import { useNearestPub } from '../hooks/useNearestPub';
import { useGeolocation } from '../hooks/useGeolocation';
import { haversineM } from '../lib/geo';
import { BigButton } from '../components/ui/BigButton';
import { PubMiniMap } from '../components/Map/PubMiniMap';
import { Screen } from '../components/ui/Screen';
import { AlreadySearchedScreen } from './AlreadySearchedScreen';

export function ArrivalScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  const last = state.geo.last;
  const { nearest } = useNearestPub(last, pubs, appConfig.arrivalRadiusM);

  const pending = state.pendingPubId
    ? (pubs.find((p) => p.id === state.pendingPubId) ?? null)
    : (nearest?.pub ?? null);

  const distanceKm =
    last && pending
      ? haversineM(last.lat, last.lng, pending.lat, pending.lng) / 1000
      : null;

  const confirm = () => {
    void sample();
    dispatch({
      type: 'CONFIRM_PUB',
      at: Date.now(),
      challengeCount: challenges.length,
      loop: appConfig.loopChallenges,
    });
  };

  const openDirections = () => {
    if (!pending) return;
    const { lat, lng } = pending;
    const isMobile = /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    // Universal Google Maps directions link. On both iOS and Android this
    // opens the Google Maps app when it's installed, otherwise the web map.
    // (The web can't detect or invoke a device's "default" maps app, so we
    // target Google directly rather than letting iOS force Apple Maps.)
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    // On mobile, navigate the same window so the OS can hand off to the
    // native app — opening a new tab can leave a dead blank tab behind.
    // On desktop, open the web map in a new tab to keep the game open.
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, '_blank');
    }
  };

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
      title={pending?.name ?? copy.arrival.heading}
      subtitle={pending?.phonetic ? <em>[{pending.phonetic}]</em> : undefined}
      footer={
        <BigButton
          variant="primary"
          onClick={() => dispatch({ type: 'CANCEL_ARRIVAL' })}
        >
          Back to all pubs
        </BigButton>
      }
    >
      {pending && (
        <>
          {distanceKm !== null && (
            <p className="muted text-center pub-distance">
              {distanceKm.toFixed(1)} km away
            </p>
          )}
          <PubMiniMap pub={pending} onClick={openDirections} />
          <BigButton variant="secondary" onClick={openDirections}>
            Get Directions
          </BigButton>
          <BigButton variant="success" onClick={confirm}>
            We've Arrived
          </BigButton>
        </>
      )}
    </Screen>
  );
}
