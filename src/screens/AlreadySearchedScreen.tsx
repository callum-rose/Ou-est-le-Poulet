import { copy } from '../config/app.config';
import { pubs } from '../config/data';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

interface AlreadySearchedScreenProps {
  pubId: string;
  onBack: () => void;
}

/** Shown when a team taps a pub they've already fully searched. */
export function AlreadySearchedScreen({
  pubId,
  onBack,
}: AlreadySearchedScreenProps) {
  const pub = pubs.find((p) => p.id === pubId);
  return (
    <Screen
      title={copy.alreadySearched.heading}
      subtitle={pub ? pub.name : undefined}
      footer={
        <BigButton variant="secondary" onClick={onBack}>
          {copy.alreadySearched.cta}
        </BigButton>
      }
    >
      <p>{copy.alreadySearched.body}</p>
    </Screen>
  );
}
