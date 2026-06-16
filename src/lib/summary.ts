import { pubs } from '../config/data';
import type { GameState } from '../types';
import { approxDistanceM, completedVisits, totalTimeMs } from '../state/selectors';
import { formatDistance } from './geo';
import { formatDuration } from './time';

function pubName(pubId: string): string {
  return pubs.find((p) => p.id === pubId)?.name ?? pubId;
}

/** Plain-text, shareable hunt summary (WhatsApp-friendly). */
export function buildShareText(state: GameState, now: number): string {
  const team = state.team?.name ?? 'Our team';
  const visits = completedVisits(state);
  const route = visits.map((v, i) => `${i + 1}. ${pubName(v.pubId)}`).join('\n');
  const time = formatDuration(totalTimeMs(state, now));
  const distance = formatDistance(approxDistanceM(state));

  const lines = [
    `🍺 ${team} found the stag!`,
    '',
    `⏱️ Time: ${time}`,
    `📍 Pubs searched: ${visits.length}`,
    `🚶 Approx distance: ${distance}`,
  ];
  if (route) {
    lines.push('', 'Route:', route);
  }
  return lines.join('\n');
}
