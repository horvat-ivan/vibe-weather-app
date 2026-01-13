# Vibe Weather App — Technical Plan

## 1. Architecture Overview
- **Client-first PWA** built with React + TypeScript + Vite for fast iteration, bundled as a single-page application that can run offline via a service worker.
- **State Management** handled through React Query for async caching plus lightweight global context for user preferences (preferred units, saved locations).
- **Data Layer** pulls hourly/daily forecasts from the free Open-Meteo API, which requires no API key and supports geocoordinates + timezone-aware responses.
- **Offline + Sync** managed locally with IndexedDB (via idb wrapper) to store the last successful forecast per location and user preferences.
- **Notifications** delivered via the Web Push API in a later phase once core functionality stabilizes.

## 2. External Services & Contracts
| Concern | Choice | Notes |
| --- | --- | --- |
| Weather data | Open-Meteo `/forecast` endpoint | Query parameters: `latitude`, `longitude`, `hourly`, `daily`, `current_weather`, `timezone`. Rate limit ~10k/day per IP. |
| Geocoding | Open-Meteo Geocoding API | Used for manual search and reverse geocoding fallback when device coordinates unavailable. |
| Icons | Custom Lottie/SVG set | Represents vibes + weather states, packaged locally. |

## 3. Data Flow
1. User grants location permission or searches a city.
2. Location module normalizes into coordinates + timezone and stores in preferences.
3. Fetch layer calls Open-Meteo hourly/daily endpoints, normalizes metrics (metric/imperial) and writes both network + cache layers.
4. Vibe engine derives a vibe tag (e.g., `out_and_about`, `cozy_day`) plus guidance metadata using rule tables.
5. UI renders summary hero, vibe card, hourly timeline, and actionable cards, sourcing from React Query caches.
6. Service worker caches shell assets + last forecast for offline bootstrap; stale data flagged until new fetch completes.

## 4. Module Breakdown
- **App Shell**: routing, layout system, theme tokens, skeleton states.
- **Location Service**: wraps Geolocation API, Open-Meteo geocoding, and saved locations storage.
- **Forecast Client**: typed fetcher with retry/backoff, unit normalization, and React Query integration.
- **Vibe Engine**: deterministic rule evaluation based on temperature bands, feels-like deltas, precipitation probability, wind speed, daylight, and humidity.
- **Guidance Generator**: maps vibe outcomes to clothing, activity, and alert suggestions; supports tiered severity (info, heads-up, urgent).
- **Persistence Layer**: IndexedDB store for forecasts, preferences, favorites, and shareable card snapshots.
- **Share & Export**: serverless-friendly module that renders vibe card to canvas for download or copying link parameters.
- **Notifications (Future)**: service worker push subscription, server hook for scheduling significant weather change alerts.

## 5. Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind (utility styling) + CSS variables for themes.
- **Data**: React Query, Zod for runtime validation, dayjs for date math.
- **Build & Quality**: ESLint (typescript + jsx), Prettier, Vitest + Testing Library for unit/component tests, Playwright for PWA smoke tests.

## 6. Implementation Phases
1. **Foundation**
   - Bootstrap React/Vite project, configure TypeScript, linting, testing, and Tailwind tokens.
   - Implement layout shell, typography, tokens, and base routing.
2. **Core Weather Experience**
   - Location service (auto + manual search) and Open-Meteo fetch client.
   - Display current conditions, hourly and daily forecast cards with skeleton/loading states.
3. **Vibe & Guidance Layer**
   - Implement rule tables, vibe summaries, and clothing/activity recommendations.
   - Add favorites persistence and shareable card export.
4. **Offline & Resilience**
   - Service worker caching, IndexedDB persistence, stale indicators, graceful error handling.
   - Accessibility pass (keyboard nav, high-contrast theme, screen reader annotations).
5. **Enhancements**
   - Web push notification flow for weather changes.
   - Performance tuning, analytics instrumentation, localization scaffolding.

## 7. Risks & Mitigations
- **API rate limits / downtime**: Cache per-location forecasts and expose degraded mode messaging; allow manual refresh with exponential backoff.
- **Geolocation denial**: ensure city search UX is first-class and persist last-used location.
- **Rule accuracy**: run user testing with telemetry hooks to adjust vibe thresholds.
- **Offline storage quota**: trim cached locations (max 5) and reuse shareable card assets.

## 8. Documentation & Tracking
- Maintain `/docs/tasks.md` (to be created) for sprint-ready tasks mapped to phases.
- Record architectural decisions in `/docs/adr/` as decisions emerge.
