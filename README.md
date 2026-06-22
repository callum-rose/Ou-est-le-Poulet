# Ou est le Poulet

A mobile-first web game built for a stag do in Prague. The stag hides in one of
the city's pubs, and teams race around town — drinking, completing challenges,
and tracking him down. First team to find his pub wins.

> ⚠️ **This was vibe-coded for speed and built for a single one-time event.**
> It's not production-hardened or written for reuse. I may eventually generalise
> it into something other people can configure for their own pub crawls / stag
> dos, but right now it's purpose-built for one weekend.

## What it does

Players open the site on their phones and play through a guided loop:

1. **Welcome → name your team → read the rules → tap Ready.**
2. **Pick a pub to search.** A live map (Leaflet + OpenStreetMap) shows the
   pubs and, if location is allowed, the team's current position.
3. **Travel challenge.** On the way to the chosen pub the app hands out a
   challenge to complete en route. Answers get sent to the stag on WhatsApp for
   approval.
4. **Arrive.** When the team gets within ~75 m of a pub the app auto-suggests
   it; otherwise they confirm by hand.
5. **Pub challenge.** Each pub has its own challenge to finish before leaving.
6. **Repeat** — walk, challenge, pub, challenge — until someone finds the pub
   the stag is hiding in and taps "We found him!"

Along the way the app records a GPS breadcrumb trail, dwell time per pub, and
the route taken, then shows a **stats / victory screen** with total time, pubs
searched, approximate distance walked, and a shareable result.

There's also a hidden **organiser cheat-sheet** (`/#/cheatsheet`) listing every
pub, challenge, and the rules, plus a QR code for onboarding players. Don't show
it to the teams.

## How it works

- **Stack:** React 18 + TypeScript, built with Vite. Routing via
  `react-router-dom` (HashRouter, so it works on static hosting). Maps via
  `react-leaflet`. QR code via `qrcode.react`.
- **Game state** is a single reducer (`src/state/gameReducer.ts`) driven by a
  small set of actions, exposed through `GameContext`. The whole game is modelled
  as a sequence of phases (`welcome → setup → rules → ready → hunting → arrival
  → travel → challenge → found`).
- **Phase-driven routing.** `PhaseGate` in `src/App.tsx` keeps the URL/history
  and the current phase in sync, so the phone's Back/Forward buttons move
  between in-app screens instead of leaving the site, and deep links can't jump
  ahead of where the team actually is.
- **Persistence.** State is saved to `localStorage` (see
  `src/state/persistence.ts`) so a refresh or accidental tab close resumes the
  hunt where it left off. Breadcrumbs are capped to stay under storage limits.
- **Geolocation** is foreground-only polling (`src/hooks/useGeolocation.ts`),
  used to draw the live position and detect arrival at a pub. The game is fully
  playable by hand if location is denied.
- **Content lives in plain text files**, so a non-developer can edit the game
  without touching code:
  - `src/config/pubs.txt` — one Google Maps place URL per line (name + coords
    are parsed out of the URL).
  - `src/config/challenges.txt` — pub challenges (`title | description | optional image URL`).
  - `src/config/travel-challenges.txt` — challenges handed out between pubs.
  - `src/config/app.config.ts` — tunables (arrival radius, poll cadence, map
    defaults) and **all player-facing copy** in one place.

  Malformed lines are skipped with a console warning rather than crashing the
  app, since these files are hand-edited.

## Deployment

Pushes to `main` build and publish to GitHub Pages via the workflow in
`.github/workflows/`. The site is served from a custom domain at the root, so
`base` is `'/'` in `vite.config.ts` — see the note there before changing it.
