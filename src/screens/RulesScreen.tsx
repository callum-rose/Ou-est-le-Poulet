import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function RulesScreen() {
  const { state, dispatch } = useGame();

  return (
    <Screen
      title={copy.rulesScreen.heading}
      subtitle={state.team ? `Team: ${state.team.name}` : undefined}
      footer={
        <BigButton onClick={() => dispatch({ type: 'ACCEPT_RULES' })}>
          {copy.rulesScreen.cta}
        </BigButton>
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
