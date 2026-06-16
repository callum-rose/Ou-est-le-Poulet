import { useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function RulesScreen() {
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const fromNav = location.state?.fromNav as string | undefined;

  return (
    <Screen
      title={copy.rulesScreen.heading}
      footer={
        fromNav ? (
          <BigButton onClick={() => navigate(fromNav)}>
            {copy.rulesScreen.backCta}
          </BigButton>
        ) : (
          <BigButton onClick={() => dispatch({ type: 'ACCEPT_RULES' })}>
            {copy.rulesScreen.cta}
          </BigButton>
        )
      }
    >
      {/* Shares the single source of rules with the organiser cheat-sheet. */}
      <ul className="cheat-list">
        {copy.rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ul>
    </Screen>
  );
}
