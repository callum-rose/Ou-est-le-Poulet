// All tunables and player-facing copy live here so re-theming and content
// changes never touch game logic. Real pub/challenge data goes in the JSON
// files alongside this module.

export const appConfig = {
  /** Persisted localStorage key. Bump the suffix only via schemaVersion. */
  storageKey: 'stag-hunt:v1',
  schemaVersion: 1,

  /** Loop back to challenge #1 when the list is exhausted. */
  loopChallenges: true,

  /** Light foreground GPS polling cadence. */
  pollIntervalMs: 60_000,

  /** A team within this many metres of a pub is auto-suggested on arrival. */
  arrivalRadiusM: 75,

  /** Hard cap on stored breadcrumbs to stay well under localStorage limits. */
  breadcrumbCap: 1000,

  /** Map defaults — overridden by fitting to the pubs on load. */
  map: {
    fallbackCenter: [50.087, 14.421] as [number, number], // Prague
    fallbackZoom: 14,
    maxZoom: 19,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
} as const;

// ---------------------------------------------------------------------------
// Player-facing copy. Keep all user-visible strings here.
// ---------------------------------------------------------------------------

export const copy = {
  appTitle: 'Pub Hunt',
  tagline: "Find the stag before the beer runs out.",

  welcome: {
    heading: "Welcome to Jack's pub crawl",
    body: "The stag is hiding in one of Prague's finest pubs. Round up your team, sink a few, and track him down.",
    cta: "Let's go",
    photoAlt: 'Jack',
  },
  setup: {
    heading: 'Name your team',
    placeholder: 'e.g. The Liver Birds',
    cta: 'Continue',
  },
  rulesScreen: {
    heading: 'The rules',
    cta: 'Got it — continue',
    backCta: '← Back',
  },
  ready: {
    heading: 'Ready to hunt?',
    body: "Tap Ready to start the clock. We'll ask for your location so the map can help — but you can always pick pubs by hand.",
    cta: "Ready — let's go",
  },
  hunt: {
    heading: 'Where to next?',
    body: 'Pick a pub to search. The stag is hiding in one of them.',
    pickPrompt: 'Choose a pub to search',
    foundCta: 'We found him! 🎉',
    statsLink: 'Stats',
    allSearchedNotice:
      "You've searched every pub — he must be in one you've been to. Time for the WhatsApp clues!",
    foundConfirm: 'Found the stag? This ends the game and stamps your finish time.',
    foundConfirmCta: 'Yes, we found him!',
    foundConfirmCancel: 'Not yet',
  },
  arrival: {
    heading: 'Arrived at a pub?',
    suggestPrefix: 'Looks like you might be at',
    noSuggestion: 'Pick the pub you have arrived at:',
    confirmCta: 'Yes, search here',
    pickOther: 'Or choose a different pub',
    cancel: 'Not here yet',
    backToAllPubs: 'Back to all pubs',
    distanceSuffix: 'km away',
    directionsCta: 'Get Directions',
    arrivedCta: "We've Arrived",
  },
  challenge: {
    heading: 'Your challenge',
    introSubtitle: 'Before you set off',
    completedCta: 'Challenge completed',
    noneLeft:
      "You've done every challenge — nice work. Keep hunting, no challenge this round.",
  },
  alreadySearched: {
    heading: 'Already searched',
    body: "Your team has already searched this pub. He's not here — try somewhere new.",
    cta: 'Back to the hunt',
  },
  victory: {
    heading: 'You found him! 🏆',
    shareCta: 'Share result',
    shareCopied: 'Copied to clipboard',
    statsLink: 'Full stats',
    resumeHuntCta: 'Resume hunt',
    routeHeading: 'Your route',
  },
  stats: {
    heading: 'Your hunt',
    distanceDisclaimer: 'Distance is approximate (rough GPS).',
    resetCta: 'Reset game',
    resetConfirm:
      'This wipes your team, progress and trail. This cannot be undone. Reset?',
    resetConfirmCta: 'Yes, wipe everything',
    resetCancel: 'Cancel',
    backCta: 'Back',
    pubsInOrderHeading: 'Pubs in order',
    dwellLabel: 'dwell',
  },
  geo: {
    denied:
      "Location is off, so the map can't show where you are. You can still pick pubs by hand.",
    unavailable: "Location isn't available on this device. Pick pubs by hand.",
    foregroundOnly: 'Location only updates while this app is open on screen.',
  },
  cheatsheet: {
    heading: 'Organiser cheat-sheet',
    warning: 'Do not show this to players — it lists the pubs and challenges.',
    pubsHeading: 'Pubs',
    challengesHeading: 'Challenges',
    rulesHeading: 'Rules',
    qrHeading: 'Player onboarding',
    qrBody: 'Scan to open the hunt app.',
    backLink: 'Back to app',
  },
  appHeader: {
    rulesAriaLabel: 'Rules',
  },
  pubList: {
    searchedBadge: '✓ searched',
    nearestBadge: 'nearest',
  },
  pubMiniMap: {
    openAriaPrefix: 'Open',
    openAriaSuffix: 'in Google Maps',
  },

  statLabels: {
    totalTime: 'Total time',
    pubsSearched: 'Pubs searched',
    approxDistance: 'Approx distance',
    gpsSamples: 'GPS samples',
  },

  rules: [
    'The stag is hiding in one pub from the list.',
    'Split into teams. Each team uses one phone.',
    'At each pub: search for the stag, have a drink, do the challenge.',
    'The stag judges challenges over WhatsApp.',
    'First team to find the stag wins.',
  ],
} as const;
