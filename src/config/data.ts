import type { Challenge, Pub } from '../types';
import pubsTxt from './pubs.txt?raw';
import challengesTxt from './challenges.txt?raw';

function parsePubs(txt: string): Pub[] {
  return txt
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url, i) => {
      const match = url.match(/\/maps\/place\/([^/@]+)\/@([-\d.]+),([-\d.]+)/);
      if (!match) throw new Error(`Invalid pub URL on line ${i + 1}: ${url}`);
      const [, nameEncoded, lat, lng] = match;
      return {
        id: `pub-${String(i + 1).padStart(2, '0')}`,
        name: decodeURIComponent(nameEncoded.replace(/\+/g, ' ')),
        lat: Number(lat),
        lng: Number(lng),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function parseChallenges(txt: string): Challenge[] {
  return txt
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const sep = line.indexOf(' | ');
      if (sep === -1) throw new Error(`Missing ' | ' separator on challenge line ${i + 1}: ${line}`);
      return {
        title: line.slice(0, sep),
        description: line.slice(sep + 3),
      };
    });
}

export const pubs: Pub[] = parsePubs(pubsTxt);
export const challenges: Challenge[] = parseChallenges(challengesTxt);
