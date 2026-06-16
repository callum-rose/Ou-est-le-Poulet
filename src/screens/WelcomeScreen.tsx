import { Link } from 'react-router-dom';
import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function WelcomeScreen() {
  const { dispatch } = useGame();

  return (
    <Screen
      title={copy.welcome.heading}
      subtitle={copy.appTitle}
      footer={
        <>
          <BigButton onClick={() => dispatch({ type: 'BEGIN' })}>
            {copy.welcome.cta}
          </BigButton>
          <div className="link-row">
            <Link to="/cheatsheet">Organiser</Link>
          </div>
        </>
      }
    >
      <p>{copy.welcome.body}</p>
    </Screen>
  );
}
