import { copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function ChallengeScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  // The open visit is the last one without a completion stamp.
  const openVisit = [...state.visits].reverse().find((v) => v.completedAt === null);
  const pub = openVisit ? pubs.find((p) => p.id === openVisit.pubId) : undefined;
  const challenge =
    openVisit && challenges.length > 0
      ? challenges[openVisit.challengeIndex]
      : undefined;

  const complete = () => {
    void sample();
    dispatch({ type: 'COMPLETE_PUB', at: Date.now() });
  };

  return (
    <Screen
      title={copy.challenge.heading}
      subtitle={pub ? `At ${pub.name}` : undefined}
      footer={
        <BigButton variant="success" onClick={complete}>
          {copy.challenge.completedCta}
        </BigButton>
      }
    >
      {challenge ? (
        <>
          <h2>{challenge.title}</h2>
          <p>{challenge.description}</p>
        </>
      ) : (
        <p className="notice">{copy.challenge.noneLeft}</p>
      )}
    </Screen>
  );
}
