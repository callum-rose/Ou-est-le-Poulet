import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function WelcomeScreen() {
  const { dispatch } = useGame();

  return (
    <Screen
      className="welcome"
      title={copy.welcome.heading}
      subtitle={copy.tagline}
      footer={
        <BigButton onClick={() => dispatch({ type: 'BEGIN' })}>
          {copy.welcome.cta}
        </BigButton>
      }
    >
      <p>{copy.welcome.body}</p>
      <img src="/IMG_2317_3.jpeg" alt="Jack" className="welcome__photo" />
    </Screen>
  );
}
