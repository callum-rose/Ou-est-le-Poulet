import { copy } from '../config/app.config';
import { pubs, travelChallenges } from '../config/data';
import { useGame } from '../state/GameContext';
import { activeTravelVisit } from '../state/gameReducer';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { ChallengeImage } from '../components/ui/ChallengeImage';
import { Linkify } from '../components/ui/Linkify';
import { Screen } from '../components/ui/Screen';

export function TravelChallengeScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  // The single outstanding travel challenge. Absent when navigated here without
  // one due (e.g. the opening leg with the first-leg flag off).
  const active = activeTravelVisit(state);
  const challenge =
    active && active.challengeIndex < travelChallenges.length
      ? travelChallenges[active.challengeIndex]
      : undefined;

  const targetPubId = active?.targetPubId ?? state.pendingPubId;
  const pub = targetPubId ? pubs.find((p) => p.id === targetPubId) : undefined;

  const complete = () => {
    void sample();
    dispatch({ type: 'COMPLETE_TRAVEL', at: Date.now() });
  };
  const leave = () => dispatch({ type: 'LEAVE_TRAVEL' });

  return (
    <Screen
      title={copy.travel.heading}
      subtitle={
        challenge && pub ? `${copy.travel.subtitlePrefix} ${pub.name}` : undefined
      }
      footer={
        challenge ? (
          <>
            <BigButton variant="success" onClick={complete}>
              {copy.travel.doneCta}
            </BigButton>
            <BigButton variant="primary" onClick={leave}>
              {copy.travel.leaveCta}
            </BigButton>
          </>
        ) : (
          <BigButton variant="primary" onClick={leave}>
            {copy.travel.continueCta}
          </BigButton>
        )
      }
    >
      {challenge ? (
        <>
          <h2>{challenge.title}</h2>
          <p><Linkify>{challenge.description}</Linkify></p>
          {challenge.imageUrl && (
            <ChallengeImage url={challenge.imageUrl} alt={challenge.title} />
          )}
        </>
      ) : (
        <p className="notice">{copy.travel.noneLeft}</p>
      )}
    </Screen>
  );
}
