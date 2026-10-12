# Add Danzario class planning workspace with Firebase persistence

The repository previously contained only a prototype description. This PR adds a complete React 18/TypeScript app for dance teachers: services and itinerary templates, choreography folders, monthly student cycles, class planning, attendance, completion, and emotional check-ins.

The Spanish mobile-first interface uses the requested dark palette and fonts. Google authentication isolates each teacher's Firestore records; cycle attendance derives from given classes rather than a second attendance store. Includes Firebase rules/emulators, tests, CI, Vercel SPA configuration, and setup documentation.

See `docs/VALIDATION.md` for actual checks and screenshots. A real Firebase project and its Google provider/authorized domains must be configured before cloud sign-in can be verified. Vercel preview publication depends on that setup. No production deployment or legacy-data migration is included.

## Validation

- TypeScript, ESLint, formatting, and production build passed.
- 8 planning tests, 10 Firestore rules tests, and 12 desktop/mobile Chromium workflows passed locally.
- Production dependency audit reports zero vulnerabilities.
- Windows WebKit cannot launch locally; Safari verification remains pending. The Linux CI includes WebKit coverage.
- Browser diagnostics only exempt the documented WebKit emulator-channel teardown messages during explicitly tracked hard navigation. A separate in-app navigation control requires zero errors, and closed mobile navigation is hidden from keyboard and accessibility traversal.

## Preview screenshots

![Desktop home](https://github.com/arquitecturacurva-sudo/DANZARIO/blob/feat/danzario-class-planner/docs/screenshots/home-desktop.png?raw=true)

![Mobile home](https://github.com/arquitecturacurva-sudo/DANZARIO/blob/feat/danzario-class-planner/docs/screenshots/home-mobile.png?raw=true)
