import { copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function ChallengeScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  // A challenge comes either from the open pub visit (the last one without a
  // completion stamp) or, before any pub, from the opening "intro" challenge.
  const openVisit = [...state.visits].reverse().find((v) => v.completedAt === null);
  const challengeIndex = openVisit
    ? openVisit.challengeIndex
    : state.introChallengeIndex;
  const pub = openVisit ? pubs.find((p) => p.id === openVisit.pubId) : undefined;
  const challenge =
    challengeIndex !== null && challengeIndex !== undefined && challenges.length > 0
      ? challenges[challengeIndex]
      : undefined;

  const complete = () => {
    void sample();
    dispatch({ type: 'COMPLETE_PUB', at: Date.now() });
  };

  return (
    <Screen
      title={copy.challenge.heading}
      subtitle={pub ? `At ${pub.name}` : copy.challenge.introSubtitle}
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
