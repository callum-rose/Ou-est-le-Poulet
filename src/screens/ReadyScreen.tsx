import { useState } from 'react';
import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Screen } from '../components/ui/Screen';

export function ReadyScreen() {
  const { dispatch } = useGame();
  const { sample } = useGeolocation();
  const [explain, setExplain] = useState(false);

  const begin = (requestLocation: boolean) => {
    setExplain(false);
    // The confirming tap is the user gesture iOS requires before the
    // geolocation prompt, so request location straight from it.
    if (requestLocation) void sample();
    dispatch({ type: 'START_GAME', at: Date.now() });
  };

  return (
    <Screen
      title={copy.ready.heading}
      footer={
        <BigButton variant="success" onClick={() => setExplain(true)}>
          {copy.ready.cta}
        </BigButton>
      }
    >
      <p>{copy.ready.body}</p>

      {explain && (
        <ConfirmDialog
          message={copy.ready.locationExplainer}
          confirmLabel={copy.ready.locationExplainerCta}
          cancelLabel={copy.ready.locationExplainerCancel}
          onConfirm={() => begin(true)}
          onCancel={() => begin(false)}
        />
      )}
    </Screen>
  );
}
