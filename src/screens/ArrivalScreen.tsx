import { useState } from 'react';
import { appConfig, copy } from '../config/app.config';
import { challenges, pubs, travelChallenges } from '../config/data';
import { useGame } from '../state/GameContext';
import {
  isPubCompleted,
  pendingTravelChallengeIndex,
} from '../state/gameReducer';
import { useNearestPub } from '../hooks/useNearestPub';
import { useGeolocation } from '../hooks/useGeolocation';
import { haversineM } from '../lib/geo';
import { BigButton } from '../components/ui/BigButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { PubMiniMap } from '../components/Map/PubMiniMap';
import { Screen } from '../components/ui/Screen';
import { AlreadySearchedScreen } from './AlreadySearchedScreen';

export function ArrivalScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();
  const [confirmingTravel, setConfirmingTravel] = useState(false);

  const last = state.geo.last;
  const { nearest } = useNearestPub(last, pubs, appConfig.arrivalRadiusM);

  const pending = state.pendingPubId
    ? (pubs.find((p) => p.id === state.pendingPubId) ?? null)
    : (nearest?.pub ?? null);

  const distanceKm =
    last && pending
      ? haversineM(last.lat, last.lng, pending.lat, pending.lng) / 1000
      : null;

  // The travel challenge this leg is gated on: the outstanding one if they've
  // already set off, else the next one due. Null when nothing is owed (first
  // leg with the flag off, list exhausted, or already done this leg) — arrival
  // then confirms directly.
  const travelIndex = pendingTravelChallengeIndex(state);
  const travelChallenge =
    travelIndex !== null && travelIndex < travelChallenges.length
      ? travelChallenges[travelIndex]
      : undefined;

  const confirm = () => {
    void sample();
    dispatch({
      type: 'CONFIRM_PUB',
      at: Date.now(),
      challengeCount: challenges.length,
      loop: appConfig.loopChallenges,
    });
  };

  // Surface an outstanding/owed travel challenge once before searching here.
  const arrive = () => {
    if (travelChallenge) {
      setConfirmingTravel(true);
    } else {
      confirm();
    }
  };

  const openDirections = () => {
    if (!pending) return;
    const { lat, lng } = pending;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isMobile = isIOS || /Android/.test(ua);
    // Universal HTTPS links: iOS hands maps.apple.com off to Apple Maps,
    // Android hands the Google Maps URL off to the Google Maps app, and
    // desktop opens the web map.
    const url = isIOS
      ? `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=w`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
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
          {copy.arrival.backToAllPubs}
        </BigButton>
      }
    >
      {pending && (
        <>
          {distanceKm !== null && (
            <p className="muted text-center pub-distance">
              {distanceKm.toFixed(1)} {copy.arrival.distanceSuffix}
            </p>
          )}
          <PubMiniMap pub={pending} onClick={openDirections} />
          <BigButton variant="secondary" onClick={openDirections}>
            {copy.arrival.directionsCta}
          </BigButton>
          {travelChallenge && (
            <BigButton
              variant="secondary"
              onClick={() => dispatch({ type: 'OPEN_TRAVEL', at: Date.now() })}
            >
              {copy.arrival.headingCta} {pending.name}
            </BigButton>
          )}
          <BigButton variant="success" onClick={arrive}>
            {copy.arrival.arrivedCta}
          </BigButton>
        </>
      )}
      {confirmingTravel && travelChallenge && (
        <ConfirmDialog
          message={
            <>
              {copy.travel.arrivalConfirm}
              <br />
              <br />
              <strong>{travelChallenge.title}</strong>
              <br />
              {travelChallenge.description}
            </>
          }
          confirmLabel={copy.travel.arrivalConfirmCta}
          cancelLabel={copy.travel.arrivalConfirmCancel}
          onConfirm={() => {
            setConfirmingTravel(false);
            confirm();
          }}
          onCancel={() => setConfirmingTravel(false)}
        />
      )}
    </Screen>
  );
}
