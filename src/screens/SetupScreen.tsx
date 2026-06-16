import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { copy } from '../config/app.config';
import { useGame } from '../state/GameContext';
import { BigButton } from '../components/ui/BigButton';
import { Screen } from '../components/ui/Screen';

const ORGANISER_TAPS = 3;
const TAP_RESET_MS = 2000;

export function SetupScreen() {
  const { dispatch } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'SET_TEAM_NAME', name: trimmed });
  };

  const handleTitleTap = () => {
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapCount.current += 1;
    if (tapCount.current >= ORGANISER_TAPS) {
      tapCount.current = 0;
      navigate('/cheatsheet');
      return;
    }
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TAP_RESET_MS);
  };

  return (
    <Screen
      title={copy.appTitle}
      subtitle={copy.tagline}
      onTitleClick={handleTitleTap}
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
