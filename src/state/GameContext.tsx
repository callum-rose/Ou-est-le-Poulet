import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type { Dispatch } from 'react';
import type { GameAction, GameState } from '../types';
import { gameReducer } from './gameReducer';
import { loadState, saveState } from './persistence';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 300;

export function GameProvider({ children }: { children: ReactNode }) {
  // Lazy init reads persisted state once on mount (auto-resume).
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  // Debounced persistence: write at most every SAVE_DEBOUNCE_MS.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => saveState(state), SAVE_DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state]);

  // Flush on unload so a quick close doesn't lose the last few actions.
  useEffect(() => {
    const flush = () => saveState(state);
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
