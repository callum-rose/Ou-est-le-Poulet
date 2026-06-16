// Shared types for the pub-hunt game.

export type GamePhase =
  | 'setup'
  | 'ready'
  | 'hunting'
  | 'arrival'
  | 'challenge'
  | 'found';

export interface Pub {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Challenge {
  title: string;
  description: string;
}

/** A single search of a pub, in arrival order. */
export interface Visit {
  pubId: string;
  /** Index into the challenges list shown at this pub (loop-aware). */
  challengeIndex: number;
  arrivedAt: number; // epoch ms
  completedAt: number | null; // epoch ms once the challenge is done
}

/** A GPS sample. */
export interface Breadcrumb {
  lat: number;
  lng: number;
  t: number; // epoch ms
  acc?: number; // accuracy in metres, if known
}

export type GeoStatus = 'unknown' | 'granted' | 'denied' | 'unavailable';

export interface GameState {
  schemaVersion: number;
  phase: GamePhase;
  team: { name: string } | null;
  startedAt: number | null; // set on START_GAME
  finishedAt: number | null; // set on FOUND_STAG
  visits: Visit[]; // ordered by arrival
  challengeCursor: number; // next challenge index to hand out
  pendingPubId: string | null; // pub awaiting arrival confirmation
  breadcrumbs: Breadcrumb[]; // capped (see persistence)
  geo: {
    status: GeoStatus;
    last: Breadcrumb | null;
  };
}

export type GameAction =
  | { type: 'SET_TEAM_NAME'; name: string }
  | { type: 'START_GAME'; at: number }
  | { type: 'ARRIVE_AT_PUB'; pubId: string; at: number }
  | { type: 'CONFIRM_PUB'; at: number; challengeCount: number; loop: boolean }
  | { type: 'CANCEL_ARRIVAL' }
  | { type: 'COMPLETE_PUB'; at: number }
  | { type: 'FOUND_STAG'; at: number }
  | { type: 'RESUME_HUNT' }
  | { type: 'PUSH_BREADCRUMB'; crumb: Breadcrumb; cap: number }
  | { type: 'SET_GEO_STATUS'; status: GeoStatus }
  | { type: 'RESET_GAME' };
