# Vibe Weather App

Modern PWA shell for translating weather data into vibe-forward guidance. Built with React, Vite, Tailwind v4, and a mocked location service while the Open-Meteo integration is under construction.

## Local Development

| Command | Description |
| --- | --- |
| `pnpm install` | Install dependencies. |
| `pnpm dev` | Run Vite in dev mode with HMR. |
| `pnpm build` | Type-check + build the production bundle. |
| `pnpm preview` | Preview the production build locally. |
| `pnpm lint` | Biome lint/format checks. |
| `pnpm test` | Vitest unit/integration tests (src only). |
| `pnpm test:e2e` | Playwright smoke tests for home + locations flows. |

> **Playwright note:** after installing dependencies run `pnpm exec playwright install --with-deps chromium webkit` once to download the required browsers. The CLI sandbox here cannot bind to local ports, so run the E2E suite on your workstation to see it pass end-to-end.

Need to stay offline? Create a `.env.local` with `VITE_GEO_OFFLINE=true` so reverse geocoding skips the Open-Meteo call and relies on our curated fallback list—perfect for air-gapped dev shells.

## Quality Gate Before Task Sign-off

Guard scripts hook into commits and will block merges if any required check fails. Before declaring a task complete or requesting review, run `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` locally and fix all failures so the hooks and CI pass cleanly.

## Current Feature Highlights

- Tailwind design tokens + glassmorphism UI shell.
- LocationProvider with mocked data, manual search, recent chips, and graceful geolocation fallbacks.
- Device detection now leverages Open-Meteo's reverse geocoding to pin real cities when you're outside the mocked list.
- Locations route for selecting/pinning locations plus CTA hooks for future API work.
- Playwright coverage to keep the hero + location UX regressions in check.

## Documentation

- Task board lives in [`docs/tasks.md`](docs/tasks.md).
- Architecture decisions: [`docs/adr`](docs/adr).
- Product brief: [`docs/specification.md`](docs/specification.md).
