import { useState } from 'react';
import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

export function SetupScreen() {
  const { dispatch } = useGame();
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'SET_TEAM_NAME', name: trimmed });
  };

  return (
    <Screen
      subtitle={copy.tagline}
      footer={
        <BigButton onClick={submit} disabled={!name.trim()}>
          {copy.setup.cta}
        </BigButton>
      }
    >
      <h2>{copy.setup.heading}</h2>
      <input
        className="text-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}

        autoFocus
        autoComplete="off"
        enterKeyHint="go"
        maxLength={40}
      />
    </Screen>
  );
}
