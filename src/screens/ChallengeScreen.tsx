import { useState } from 'react';
import { copy } from '../config/app.config';
import { challenges, pubs } from '../config/data';
import { useGame } from '../state/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { ChallengeImage } from '../components/ui/ChallengeImage';
import { Linkify } from '../components/ui/Linkify';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Screen } from '../components/ui/Screen';

export function ChallengeScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();
  const [confirming, setConfirming] = useState(false);

  // The challenge comes from the open pub visit — the last one without a
  // completion stamp.
  const openVisit = [...state.visits].reverse().find((v) => v.completedAt === null);
  const challengeIndex = openVisit ? openVisit.challengeIndex : null;
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
      subtitle={pub ? `At ${pub.name}` : undefined}
      footer={
        challenge ? (
          <BigButton variant="success" onClick={() => setConfirming(true)}>
            {copy.challenge.completedCta}
          </BigButton>
        ) : (
          <BigButton variant="primary" onClick={complete}>
            {copy.challenge.continueCta}
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
        <p className="notice">{copy.challenge.noneLeft}</p>
      )}
      {confirming && (
        <ConfirmDialog
          message={copy.challenge.approvalConfirm}
          confirmLabel={copy.challenge.approvalConfirmCta}
          cancelLabel={copy.challenge.approvalCancel}
          onConfirm={complete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </Screen>
  );
}
