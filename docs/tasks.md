# Vibe Weather App — Task Backlog

## Phase 1: Foundation
- [x] Initialize Vite + React + TypeScript project structure (pnpm + Vite scaffold).
- [x] Configure Biome (lint/format), Vitest, and Testing Library.
- [x] Add Tailwind + design tokens (colors, spacing, typography).
- [x] Implement base layout shell with routing, header/footer placeholders.
- [x] Document ADR for choosing tech stack and tooling.
- [x] Add guard scripts (pre-commit/pre-push) to run `pnpm lint`, `pnpm test`, and any required checks before tasks are marked complete.
- [ ] Ensure CLI agent can run `pnpm test:e2e` successfully inside the sandbox (investigate port binding/network allowances).

## Phase 2: Core Weather Experience
- [x] Document ADR for mocked location service foundation (ADR-0002).
- [x] Build location service (geolocation + manual search) with mocked data.
- [x] Bootstrap Playwright smoke tests for home hero + Locations flow.
- [x] Implement Open-Meteo API client with typed responses and error handling.
- [x] Create current conditions hero, hourly strip, and daily cards with loading skeletons.
- [x] Fix location detection + selection so the pinned city always matches device coordinates or manual search input (backfill persistent storage + mocks to avoid fallback mismatches).
- [x] Persist last selected location in local storage/IndexedDB.
- [x] Add basic analytics/logging hooks for fetch success/failure.
- [x] Integrate a reverse-geocoding API (or hosted mock) so device coordinates resolve to real city names instead of the current hardcoded list.
- [ ] Evaluate/replace the temporary geocoding fallback list with a managed provider (BigDataCloud, OpenCage, Mapbox) and update ADR + clients accordingly.
- [ ] Expand location search beyond the current mock list by integrating a comprehensive city catalog or external geocoding API so queries like "Varaždin" resolve correctly, and overhaul the search UI for instant, debounced results.
- [ ] Auto-trigger geolocation detection on app bootstrap so we prompt for browser permission immediately and only fall back to stored/default snapshots when access is denied or unavailable. Document the flow in the tech plan.
- [ ] Add a first-time location permission prompt (modal or banner) that explains the benefit of sharing location, captures “Not now/Allow”, and suppresses repeated prompts once a preference is stored.
- [ ] Design and implement a dedicated "permission denied" state (banner/card) that instructs users how to re-enable access and offers a retry CTA wired to `detectLocation`.
- [ ] Instrument analytics for geolocation allow/deny/timeouts so we can monitor how many sessions succeed or fail and why.
- [ ] Remove redundant "Use current location" hero CTA once the auto-detect + prompt flow is in place, updating tests/routes accordingly.
- [ ] Add unit coverage for the new permission prompt logic plus a Playwright journey that simulates granting/denying geolocation (mocking the API) to keep CI green.
- [x] Add a developer/offline flag that forces reverse geocoding to use the fallback list (skip network calls) so local builds don’t surface console noise when the Open-Meteo API is unreachable.

## Phase 3: Vibe & Guidance Layer
- [ ] Improve refreshed UI pass (hero/hourly/daily) with final typography, icon set, animation polish, and Storybook docs so it fully matches iOS Weather expectations.

## Phase 3: Vibe & Guidance Layer
- [x] Design an official Vibe Weather logomark/wordmark, export responsive assets, and wire it into the hero/header, favicon, app manifest, and social share previews so the experience feels product-ready.
- [x] Define vibe taxonomy and rule matrix.
- [x] Implement vibe engine service with unit tests.
- [x] Render vibe summary card with mood-specific iconography.
- [x] Generate clothing/activity recommendations and alert tiers.
- [x] Enable favorites list with persistence and quick-switch chips.
- [ ] Add shareable vibe card export + share CTA wiring.

### UI Refresh Stories (see `docs/ui-explorations.md`)
- [x] Add an app-level loading state so the hero/planning shell only renders after the first forecast sync, including an accessible skeleton treatment.
- [x] Prevent full-screen loading on subsequent refreshes—show cached forecast while new data loads and only use the loading screen when no prior forecast exists.
- [x] Respect Open-Meteo’s configured units (temperature, wind, precipitation) in the UI and expose metadata for future unit toggles.
- [x] Simplify the main hero card by limiting copy lines, moving extended vibe summary/tags into the side card, and tightening the metric row.
- [ ] Shift the palette to a lighter base (new surface tokens + gradients) while maintaining contrast and frosted effects.
- [x] Refresh typography tokens with the chosen font pairing and a documented scale applied across components.
- [x] Reduce global navigation to the essential entry points (forecast + quick location switcher) until additional routes ship.
- [x] Detect offline mode, surface an "offline" indicator, and serve the last cached forecast instead of fake data.
- [ ] Refresh the full UI so hero, cards, and navigation share one art direction and stay responsive across desktop + mobile. *Note: scope a design exploration first to define the unified look before coding.*
- [ ] Audit the entire app for components still using deprecated styles and update them to the latest UI guidelines (palette, typography, chip/button patterns) so visual consistency is maintained everywhere.

## Phase 4: Offline & Resilience
- [x] Integrate service worker for asset + data caching.
- [ ] Store forecasts and preferences in IndexedDB with staleness indicators.
- [ ] Implement offline/poor-network banners and retry flows.
- [ ] Conduct accessibility audit (keyboard, color contrast, ARIA labels).
- [ ] Add automated PWA + performance smoke tests (Playwright/Lighthouse).
- [ ] **High priority:** implement end-to-end regression suite (Playwright or Cypress) covering location search, forecast rendering, and vibe guidance flows.

## Phase 5: Enhancements
- [ ] Implement push notification opt-in and subscription management.
- [ ] Build serverless hook/cron for significant weather change triggers.
- [ ] Improve performance (code splitting, image optimization) and add localization scaffolding.
- [ ] Instrument analytics dashboards for vibe usefulness feedback.
- [ ] Run beta testing checklist and stabilize for launch.
- [ ] (Lower priority) Refresh the UI to align with polished iOS/Android weather apps and improve overall usability.
  - Match platform-native typography scale, icon sizing, and spacing rhythm so the layout feels familiar on iOS/Android.
  - Introduce gesture-friendly modules (cards, carousels) that highlight the hero status, hourly strip, and vibe guidance without crowding.
  - Improve visual hierarchy for key actions (location switcher, favorites, alerts) with clearer affordances and contrast ratios.
  - Add subtle motion/micro-interactions (loading transitions, forecast updates) that reinforce responsiveness without hurting performance.
- [ ] Localize time formats and measurement units (°C/°F, mph/kmh, 12h/24h) per user preference/locale to ensure the hero, hourly, and daily cards feel native worldwide.
