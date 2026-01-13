# 0002 — Location Service Foundation

## Context
Phase 2 starts with enabling users to set their location via a manual search and optional device geolocation. The UI already hints at saved locations and "enable location" prompts, but there was no documented plan for how we will represent locations, prioritize mocks vs. real APIs, or expose the data to the layout shell. We also need clarity on how this service evolves toward React Query + Open-Meteo once networking work lands.

## Decision
- Introduce a client-side location domain that uses curated mock locations to unblock UX while data contracts stabilize.
- Provide a geolocator abstraction that can fall back to mock locations if the browser Geolocation API is unavailable or denied.
- Normalize location data into a `LocationSnapshot` shape that includes hero metrics, tags, and planning tiles so future pages consume a single object.
- Expose the domain through a provider/hook pair (`LocationProvider`, `useLocationService`) that will later wire into React Query/open data sources without changing consumers.
- Keep recent locations in memory for now with a max list of 5; persistence will be added alongside IndexedDB work.

## Alternatives Considered
1. **Jump straight to Open-Meteo** — rejected for now because we still need to finalize the data normalization layer and caching, and mocked data lets design iterate quickly.
2. **Use global React state without provider** — rejected because routing/screens will multiply and we want clear boundaries + testability once data fetching and persistence arrive.

## Consequences
- Developers can implement the mocked location service immediately, confident it aligns with future goals.
- When the real API client lands, we only need to swap the provider internals rather than touch every consumer.
- Adding persistence later will require decisions about storage (likely IndexedDB) but the `recentLocations` contract is already defined.

## References
- Task: Phase 2 — "Build location service (geolocation + manual search) with mocked data" (`docs/tasks.md`).
- Spec: `docs/specification.md` (§ Core Features, Location handling).
