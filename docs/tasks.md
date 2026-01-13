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

## Phase 3: Vibe & Guidance Layer
- [ ] Improve refreshed UI pass (hero/hourly/daily) with final typography, icon set, animation polish, and Storybook docs so it fully matches iOS Weather expectations.

## Phase 3: Vibe & Guidance Layer
- [x] Define vibe taxonomy and rule matrix.
- [x] Implement vibe engine service with unit tests.
- [x] Render vibe summary card with mood-specific iconography.
- [x] Generate clothing/activity recommendations and alert tiers.
- [ ] Enable favorites list with persistence and shareable card export.

### UI Refresh Stories (see `docs/ui-explorations.md`)
- [x] Add an app-level loading state so the hero/planning shell only renders after the first forecast sync, including an accessible skeleton treatment.
- [x] Prevent full-screen loading on subsequent refreshes—show cached forecast while new data loads and only use the loading screen when no prior forecast exists.
- [x] Respect Open-Meteo’s configured units (temperature, wind, precipitation) in the UI and expose metadata for future unit toggles.
- [ ] Simplify the main hero card by limiting copy lines, moving extended vibe summary/tags into the side card, and tightening the metric row.
- [ ] Shift the palette to a lighter base (new surface tokens + gradients) while maintaining contrast and frosted effects.
- [ ] Refresh typography tokens with the chosen font pairing and a documented scale applied across components.
- [ ] Reduce global navigation to the essential entry points (forecast + quick location switcher) until additional routes ship.
- [x] Detect offline mode, surface an "offline" indicator, and serve the last cached forecast instead of fake data.

## Phase 4: Offline & Resilience
- [ ] Integrate service worker for asset + data caching.
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
