# Danzario

A private class-planning workspace for dance teachers. React 18, TypeScript, Vite, Tailwind CSS, Firebase Auth, and Firestore; ready for Vercel.

## What you can do

- Create services with prices in PEN, tracking type, typical objectives, internal notes, and reusable class itineraries.
- Organize choreography into Carpetas, edit sections, track their progress, and mark a choreography finished.
- Create monthly Ciclos inside process services, with student objectives, text criteria, feedback, and an itinerary.
- Plan classes with music, warmup, activities, time blocks, attendance, emotional check-ins, and teacher notes.
- Mark classes as given or pending. Cycle attendance counts only given classes that include the student.
- See active choreography processes, class totals, services, and recent free classes on Home.

The interface is in Spanish and supports iPhone safe areas. Bebas Neue and Nunito are bundled locally. Each teacher's records live under their Firebase user ID. Production uses Google sign-in only; there is no student login, payment processing, shared workspace, or legacy localStorage migration.

## Run locally without a Firebase account

Requirements: Node.js **22.12+** (or Node 24), npm, and Java **21+** for the emulators.

```sh
npm ci
npm run emulators
```

In a second terminal:

```sh
npm run dev:emulator
```

Open the displayed localhost URL, then select **Entrar al entorno de prueba**. This creates an anonymous user in the **local Auth emulator**, not a real Firebase account. Refresh keeps that session; signing out and entering again creates a separate test teacher. The Firestore emulator enforces the same rules as production.

Emulator sign-in is gated by Vite development mode and `VITE_USE_EMULATORS=true`; production builds cannot enable it. Emulator data is temporary and should be treated as test data.

## Connect a new Firebase project

1. In the Firebase console, create your project and register a web application.
2. Create a Cloud Firestore **Standard** database in production mode. Choose the desired region before creation.
3. Under Authentication → Sign-in method, enable **Google** and set the support email.
4. Copy `.env.example` to `.env.local` and fill the four Firebase web configuration values. These identify the client project; never put Admin SDK credentials or service-account keys in `VITE_*` variables.
5. Add `localhost` and your exact Vercel preview/production hostnames under Authentication → Settings → Authorized domains. Prefer a stable branch preview URL and authorize it explicitly.
6. Authenticate the Firebase CLI locally and deploy rules to your actual project:

```sh
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID
npm run dev
```

Google authentication opens a popup from the sign-in button. Allow popups, and verify the callback on Safari/iPhone before releasing. If the web configuration is absent, Danzario shows a setup screen instead of silently falling back to demo data.

## Vercel preview

Import your fork/branch into the intended Vercel account. Select the **Vite** preset, `npm run build`, output `dist`, and Node 22 or 24. Configure the four Firebase variables from `.env.example` for **Preview**, then redeploy. Leave `VITE_USE_EMULATORS` unset or false.

`vercel.json` handles direct SPA route visits. Authorize the resulting hostname in Firebase Auth. A production release needs the corresponding variables and authorized domain in the production environment. This change does not create a Firebase cloud project or publish production automatically.

## Data and behavior

Collections: `users/{uid}/{servicios|carpetas|ciclos|clases}/{id}`. IDs are stable UUIDs; `createdAt` and `updatedAt` are epoch milliseconds. Dates and times remain local calendar strings (`YYYY-MM-DD`, `HH:mm`), so input dates do not shift through UTC.

- Carpetas and Ciclos are separate children of a `proceso` service. Classes can belong to either or both, with matching service IDs.
- Free classes have no carpeta or ciclo; they may have a service. Home filters before selecting the three most recent.
- `Carpeta.avance` stores completed section IDs. Progress ignores removed sections and is 0% for an empty choreography. `coreoTerminada` is an explicit teacher decision.
- A class gets a copy of its service itinerary; a selected ciclo overrides it and supplies a roster with stable student IDs. Later template or roster edits do not modify saved classes.
- `Alumna.criterios` maps criterion keys to free text. `asistencia` is computed from class records, not independently stored; a class without that student does not enter her attendance denominator.
- Saves are explicit and require connectivity. Failed saves keep the form contents. Internal navigation and sign-out warn about dirty forms.
- Deletion is blocked in the app while linked records remain, with a fresh dependency check before deletion. Firestore rules enforce ownership, top-level schema, and owned/matching parents; they do not implement cascade deletion. Direct external writes must preserve reference integrity. Concurrent changes from another device can race the app's dependency check; this version targets an individual teacher workflow.
- Firestore subscriptions are removed and app state remounted when the authenticated user changes. No teacher records are written to localStorage.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:rules
npx playwright install chromium webkit
```

With the Auth and Firestore emulators running:

```sh
npm run test:e2e
```

Alternatively:

```sh
npx firebase emulators:exec --project demo-danzario --only auth,firestore "npm run test:e2e"
```

CI runs type checks, lint, planning tests, build, ownership/schema tests, and Chromium/WebKit teacher workflows. Tests use no cloud credentials and do not touch production data. `docs/VALIDATION.md` records verified results and external setup limitations.

If WebKit cannot launch on the local Windows host, `npm run test:e2e:local` runs desktop and iPhone-sized Chromium. This verifies responsive behavior but does not substitute for Safari testing. CI retains the WebKit project.
