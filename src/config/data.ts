import type { Challenge, Pub } from '../types';
import pubsTxt from './pubs.txt?raw';
import challengesTxt from './challenges.txt?raw';
import travelChallengesTxt from './travel-challenges.txt?raw';

// Blank lines and `#` comments are ignored so the .txt files can carry usage
// notes. A malformed line is skipped with a warning rather than thrown: these
// files are hand-edited by a non-developer, and a single bad paste must not
// take down the whole app (a top-level throw here renders a blank black page,
// since it happens before React mounts and so escapes any error boundary).

function contentLines(txt: string): string[] {
  return txt
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function parsePubs(txt: string): Pub[] {
  const pubs: Pub[] = [];
  for (const line of contentLines(txt)) {
    // Optional reader-friendly pronunciation after a ' | ' separator.
    const sep = line.indexOf(' | ');
    const url = sep === -1 ? line : line.slice(0, sep);
    const phonetic =
      sep === -1 ? undefined : line.slice(sep + 3).trim() || undefined;

    const match = url.match(/\/maps\/place\/([^/@]+)\/@([-\d.]+),([-\d.]+)/);
    if (!match) {
      console.warn(
        `[pubs] Skipping unrecognised line — expected a full Google Maps ` +
          `place URL (.../maps/place/Name/@lat,lng), not a "maps.app.goo.gl" ` +
          `share link: ${url}`,
      );
      continue;
    }
    const [, nameEncoded, lat, lng] = match;
    pubs.push({
      id: `pub-${String(pubs.length + 1).padStart(2, '0')}`,
      name: decodeURIComponent(nameEncoded.replace(/\+/g, ' ')),
      lat: Number(lat),
      lng: Number(lng),
      phonetic,
    });
  }
  return pubs.sort((a, b) => a.name.localeCompare(b.name));
}

function parseChallenges(txt: string): Challenge[] {
  const out: Challenge[] = [];
  for (const line of contentLines(txt)) {
    const sep = line.indexOf(' | ');
    if (sep === -1) {
      console.warn(
        `[challenges] Skipping line missing the ' | ' title/description ` +
          `separator: ${line}`,
      );
      continue;
    }
    out.push({ title: line.slice(0, sep), description: line.slice(sep + 3) });
  }
  return out;
}

export const pubs: Pub[] = parsePubs(pubsTxt);
export const challenges: Challenge[] = parseChallenges(challengesTxt);
export const travelChallenges: Challenge[] = parseChallenges(travelChallengesTxt);
