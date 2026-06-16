// Static content, inlined at build time by Vite. Typed once here so screens
// import strongly-typed arrays rather than raw JSON.
import type { Challenge, Pub } from '../types';
import pubsJson from './pubs.json';
import challengesJson from './challenges.json';

export const pubs: Pub[] = [...pubsJson].sort((a, b) =>
  a.name.localeCompare(b.name),
);
export const challenges: Challenge[] = challengesJson;
