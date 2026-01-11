# Copilot instructions for sys-scholar-2

These short instructions help an AI coding agent be productive in this repository quickly.

## Big picture (what this app is)
- Single-page React app created with **Create React App** (see `package.json`).
- Uses **Firebase** (Authentication, Firestore, Storage) as the backend and data store.
- Primary domain: educational modules + tests. Modules are static HTML files (served from `/Modulos/`) rendered in an interactive test mode inside the React app.

## Key directories & files (where to look)
- src/context/AuthContext.jsx — Firebase auth + user document lifecycle (auto-creates users if missing).
- src/services/firebase/config.js — primary Firebase initialization (sets `browserLocalPersistence`). Use this file for imports (`import { auth, db } from './firebase/config'`).
- src/services/* — business logic and Firestore access (dashboardService.js, moduleService.js, testGradingService.js, testRetakeService.js). These implement Firestore read/write patterns and batch updates.
- src/components/student/HTMLModuleViewer.jsx — loads `/Modulos/{file}` and injects JS that calls `window.saveTest(...)`. This is how tests in static HTML integrate with the app.
- src/utils/moduleMapper.js & src/routes/moduleRoutes.js — module number ↔ filename ↔ title mapping (e.g. `1ro_modulo_1.html`).
- src/utils/createDemoUsers.js — helper to create demo users/modules from the browser console (useful for local QA).

## Data model & conventions (important details)
- Firestore Documents:
  - `users/{uid}`: main user doc with `progreso` object (keys `año1`, `año2` — note the `ñ` and `'1ro'/'2do'` values). Be careful with field names that include accents.
  - `users/{uid}/progress/{año1|año2}`: subcollection with `tests` (keys like `test_intro_001`) and counters (`testsCompletados`, `testsAprobados`, `promedioGeneral`, `resumen`, `metadata`).
- Test objects: contain `preguntas` keyed `q1`, `q2`, ... and fields `porcentaje`, `aprobado`, `puntajeObtenido`, `fechaCompletado` (often `serverTimestamp()`). See `dashboardService.saveTestResult` for canonical shape.
- Module filenames: use `getModuleFilename(moduleNumber, year)` pattern (`1ro_modulo_1.html`, `2do_modulo_1.html`). Module pages should live in `public/Modulos/` (component fetches `/Modulos/{filename}`).

## Patterns & best practices to follow (do when changing code)
- Use existing service functions and data shapes. Example: when saving test results, use `saveTestResult` (it performs batched updates with `writeBatch`, updates both `progress` subcollection and `users.{uid}.progreso`).
- Prefer `serverTimestamp()` for Firestore timestamps (project uses it extensively).
- Keep year logic consistent: mapping code expects `1` -> `1ro` and `2` -> `2do`. Use `formatYearForFirebase` or `getModuleFilename` helpers.
- When adding debug logs follow repository style (structured console logs with emojis and context objects).

## Local dev and debugging
- Start: `npm start` (Create React App). Tests: `npm test`; build: `npm run build`.
- Required environment variables (create `.env` in repo root):
  - `REACT_APP_FIREBASE_API_KEY`
  - `REACT_APP_FIREBASE_AUTH_DOMAIN`
  - `REACT_APP_FIREBASE_PROJECT_ID`
  - `REACT_APP_FIREBASE_STORAGE_BUCKET`
  - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
  - `REACT_APP_FIREBASE_APP_ID`

- Demo data: open the running app in a browser console and run `initializeDemoData()` (exposed by `src/utils/createDemoUsers.js`) to create demo users and modules.
- If module pages do not load, confirm static HTML files exist under `public/Modulos/` with names matching `moduleMapper`.
- Authentication persistence is configured in `src/services/firebase/config.js` using `setPersistence(auth, browserLocalPersistence)`. For tests that need fresh auth states, clear local storage or use incognito.

## Integration points & external dependencies
- Firebase (Firestore, Auth, Storage) is the only backend dependency; code expects direct client-side access.
- No CI or emulator configuration found in this repo (no GitHub Actions or `firebase.json`). If needed, add emulator configs and npm scripts.

## Quick examples to reference
- To save a test result (read before changing): `src/services/dashboardService.js -> saveTestResult` (uses `writeBatch` and updates `users/{uid}` and `users/{uid}/progress/añoX`).
- HTML modules call `window.saveTest(...)`; ensure `HTMLModuleViewer.jsx` attaches `window.saveTest = saveTestResults` when loading modules.
- To determine module file/routing: `src/utils/moduleMapper.js` and `src/routes/moduleRoutes.js`.

## When you are editing automated flows
- Preserve existing Firestore shapes to avoid breaking dashboard clients.
- When adding new Firestore fields, update `createCompleteProgressStructure` in `AuthContext.jsx` and corresponding services that read/write progress.

---
If you want, I can:
- Add short inline comments in the three most critical service files (`dashboardService.js`, `testRetakeService.js`, `AuthContext.jsx`) to clarify data shapes, or
- Create a small `CONTRIBUTING.md` checklist for routine tasks (adding a module, seeding demo data, testing saves).

Please review and tell me which additions (examples or comments) you'd like me to include or clarify. ✅
