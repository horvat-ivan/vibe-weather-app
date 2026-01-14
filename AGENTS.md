# Repository Guidelines

## Project Structure & Module Organization
This Vite + React workspace centers on [`src/`](src/). `src/main.tsx` boots the app, `src/index.css` wires Tailwind layers, and reusable UI sits in `src/components/`. Domain logic, hooks, and state live in `src/features/`, while `src/routes/` defines page shells and loaders. Drop helpers in `src/lib/`, assets in `src/assets/`, public artifacts in `public/`, and bundles in `dist/`. Playwright journeys live under [`tests/`](tests/), with specs, ADRs, and briefs inside [`docs/`](docs/).

## Build, Test, and Development Commands
Install once via `pnpm install`; daily loops rely on:
- `pnpm dev` — hot-reload dev server.
- `pnpm build` — `tsc -b` type-check + optimized bundle.
- `pnpm preview` — serve the latest build for manual QA.
- `pnpm lint` / `pnpm format` — Biome linting or auto-fix.
- `pnpm test` / `pnpm test:watch` — Vitest suites.
- `pnpm test:e2e` — Playwright smoke runs (after `pnpm exec playwright install --with-deps chromium webkit`).

## Coding Style & Naming Conventions
Biome enforces two-space indentation, 100-character lines, single quotes in TS/JS, and double quotes in JSX. Keep files in TypeScript (`.ts`/`.tsx`) and favor functional React components. Use PascalCase for components, camelCase for variables/functions, and kebab-case for filenames except React components (`WeatherCard.tsx`). Compose layouts with Tailwind utilities directly in JSX; reserve ad-hoc CSS for `App.css` edge cases.

## Testing Guidelines
Unit and integration specs co-locate next to code as `*.test.ts(x)`, leveraging Vitest + Testing Library with shared setup in `src/setupTests.ts`. Add one test per feature or fix. Playwright suites in `tests/` protect the home and locations flows—name files after the journey (`locations.pin.spec.ts`) and update selectors whenever routes change.

## Commit & Pull Request Guidelines
Follow Conventional Commits (`feat(ui): refresh cards`) matching existing history. Every PR should describe intent, link issues or tasks, and attach UI screenshots or recordings when visual output changes. Before requesting review, ensure `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm build` succeed locally; Husky hooks and CI mirror those checks.

## Security & Configuration Tips
Never commit secrets—load API keys through `.env.local` consumed by Vite. Mark temporary fixtures inside `src/features/location/` so reviewers can spot mock data quickly. Patch Playwright browsers via `pnpm exec playwright install --with-deps chromium webkit` to match CI runtime.

## Reference Docs
- [`README.md`](README.md) — project overview, command table, and feature highlights.
- [`docs/tasks.md`](docs/tasks.md) — active work board and ownership notes.
- [`docs/specification.md`](docs/specification.md) — product brief and UX intents.
- [`docs/adr`](docs/adr) — architecture decisions and rationale snapshots.
