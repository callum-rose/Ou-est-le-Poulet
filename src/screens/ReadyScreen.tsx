import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function ReadyScreen() {
  const { state, dispatch } = useGame();
  const { sample } = useGeolocation();

  const start = async () => {
    // This tap is the user gesture iOS requires before the geolocation prompt.
    void sample();
    dispatch({ type: 'START_GAME', at: Date.now() });
  };

  return (
    <Screen
      title={copy.ready.heading}
      subtitle={state.team ? `Team: ${state.team.name}` : undefined}
      footer={
        <BigButton variant="success" onClick={start}>
          {copy.ready.cta}
        </BigButton>
      }
    >
      <p>{copy.ready.body}</p>
    </Screen>
  );
}
