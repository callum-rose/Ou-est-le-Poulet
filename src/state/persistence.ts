import { appConfig } from '../config/app.config';
import { readJSON, remove, writeJSON } from '../lib/storage';
import type { GameState } from '../types';
import { initialState } from './gameReducer';

/**
 * Load persisted state. Falls back to a fresh game on parse error or a
 * schemaVersion mismatch (treated as incompatible — discard rather than
 * attempt risky migration for a throwaway party app).
 */
export function loadState(): GameState {
  const saved = readJSON<Partial<GameState>>(appConfig.storageKey);
  if (!saved || saved.schemaVersion !== appConfig.schemaVersion) {
    return initialState;
  }
  // Shallow-merge over initialState so any newly-added fields get defaults.
  return {
    ...initialState,
    ...saved,
    geo: { ...initialState.geo, ...saved.geo },
  } as GameState;
}

export function saveState(state: GameState): void {
  writeJSON(appConfig.storageKey, state);
}

export function clearState(): void {
  remove(appConfig.storageKey);
}
