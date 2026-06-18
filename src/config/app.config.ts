// All tunables and player-facing copy live here so re-theming and content
// changes never touch game logic. Real pub/challenge data goes in the JSON
// files alongside this module.

export const appConfig = {
    /** Persisted localStorage key. Bump the suffix only via schemaVersion. */
    storageKey: 'stag-hunt:v1',
    schemaVersion: 3,

    /** Loop back to challenge #1 when the list is exhausted. */
    loopChallenges: false,

    /** Hand out a travel challenge on the opening leg (start → first pub). */
    travelChallengeOnFirstLeg: true,

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
    appTitle: 'Ou Est le Poulet',
    tagline: "Find Jack before the beer runs out.",

    welcome: {
        heading: "Welcome to Jack's game of Ou Est le Poulet",
        body: "Jack is hiding in one of Prague's finest pubs. Round up your team, sink a few, and track him down.",
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
        body: "Don't tap Ready until everybody is ready.",
        cta: "Ready!",
        // Shown before the browser's location permission prompt to explain why.
        locationExplainer:
            "We use your location to show you on the map and measure how close you are to each pub. Your next tap will ask for permission — please allow it.",
        locationExplainerCta: 'Got it',
        locationExplainerCancel: 'Skip for now',
    },
    hunt: {
        heading: 'Where to next?',
        pickPrompt: 'Choose a pub to search',
        foundCta: 'We found him! 🎉',
        statsLink: 'See Your Progress',
        allSearchedNotice: "You've searched every pub — he must be in one you've been to. Time for the WhatsApp clues!",
        foundConfirm: 'Found Jack? This ends the game and stamps your finish time.',
        foundConfirmCta: 'Yes, we found him!',
        foundConfirmCancel: 'Not yet',
        // Rendered as "On the way: <travel challenge title>".
        travelBannerPrefix: 'On the way:',
    },
    arrival: {
        heading: 'Arrived?',
        suggestPrefix: 'Looks like you might be at',
        noSuggestion: 'Pick the pub you have arrived at:',
        confirmCta: 'Yes, search here',
        pickOther: 'Or choose a different pub',
        cancel: 'Not here yet',
        backToAllPubs: 'Back to all pubs',
        distanceSuffix: 'km away',
        directionsCta: 'Get Directions',
        arrivedCta: "We've Arrived",
        // Rendered as "We're heading to <pub name>".
        headingCta: "We're heading to",
    },
    travel: {
        heading: 'Travel challenge',
        subtitlePrefix: 'Heading to',
        doneCta: "We've done it",
        leaveCta: 'Back to the hunt',
        noneLeft: 'No travel challenge this leg — just get to the next pub.',
        arrivalConfirm: 'Have you finished your travel challenge?',
        arrivalConfirmCta: 'Yes, all done',
        arrivalConfirmCancel: 'Not yet',
    },
    challenge: {
        heading: 'Your challenge',
        completedCta: 'Challenge completed',
        noneLeft: "You've finished every pub challenge. Have a chilled one!",
        approvalConfirm: 'Confirm that Jack has approved this?',
        approvalConfirmCta: 'Yes',
        approvalCancel: 'No',
    },
    alreadySearched: {
        heading: 'Already searched',
        body: "Your team has already searched this pub. He's not here — try somewhere new.",
        cta: 'Back to the hunt',
    },
    stats: {
        heading: 'Your hunt',
        victoryHeading: 'You found him! 🏆',
        shareCta: 'Share result',
        shareCopied: 'Copied to clipboard',
        resumeHuntCta: 'Resume hunt',
        resetCta: 'Reset game',
        resetConfirm: 'This wipes your team, progress and trail. This cannot be undone. Reset?',
        resetConfirmCta: 'Yes, wipe everything',
        resetCancel: 'Cancel',
        backCta: 'Back',
        pubsInOrderHeading: 'Your route',
        dwellLabel: 'dwell',
        challengesDoneLabel: 'challenges done',
        nextChallengeMessage: 'Get to the next pub for your next challenge.',
        allChallengesDone: "You've completed every challenge — nice work! Now just find Jack.",
        finishedMessage: 'Hunt complete — you tracked Jack down. 🍻',
        noChallengeLabel: 'No challenge this round',
        travelStopLabel: 'On the way',
    },
    geo: {
        denied: "Location is off, so the map can't show where you are. You can still pick pubs by hand.",
        unavailable: "Location isn't available on this device. Pick pubs by hand.",
        foregroundOnly: 'Location only updates while this app is open on screen.',
    },
    cheatsheet: {
        heading: 'Organiser cheat-sheet',
        warning: 'Do not show this to players — it lists the pubs and challenges.',
        pubsHeading: 'Pubs',
        challengesHeading: 'Challenges',
        travelChallengesHeading: 'Travel challenges',
        rulesHeading: 'Rules',
        qrHeading: 'Player onboarding',
        qrBody: 'Scan to open the hunt app.',
        backLink: 'Back to app',
    },
    appHeader: {
        rulesAriaLabel: 'Rules',
        progressAriaLabel: 'Your progress',
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
    },

    rules: [
        'Jack is hiding in one of the pubs on the list.',
        'Pick a pub, then complete the challenge on your way there.',
        'Jack judges challenges over WhatsApp.',
        'Once a challenge is complete you can move on to the next pub.',
        'First team to find Jack wins.',
        'Let\'s not be a bunch of shitheads, rep England!'
    ],
} as const;
