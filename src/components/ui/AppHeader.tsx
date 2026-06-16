import { copy } from '../../config/app.config';
import { useGame } from '../../state/GameContext';

/**
 * Global header shown on every screen: the website title, plus the current
 * team name once one has been chosen.
 */
export function AppHeader() {
  const { state } = useGame();
  const teamName = state.team?.name;

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__title">{copy.appTitle}</span>
        {teamName && <span className="app-header__team">{teamName}</span>}
      </div>
    </header>
  );
}
