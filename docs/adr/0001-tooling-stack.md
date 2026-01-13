# 0001 - Frontend tooling stack

## Context
Phase 1 requires a modern frontend toolchain that is fast to scaffold, works offline, and is easy to deploy to static hosts. We also need deterministic package management for CI/CD and a single tool to cover linting + formatting instead of juggling ESLint/Prettier configs. Network sandboxing made `npm create vite` unreliable, so we evaluated alternatives that minimize install overhead. The backlog expects future ADRs to reference a canonical tooling decision.

## Decision
- Use **pnpm** for package management because it deduplicates dependencies efficiently, keeps lockfiles deterministic, and handled Vite scaffolding even with intermittent registry access.
- Scaffold the app with **Vite + React + TypeScript** for instant HMR, TS-first DX, and the ability to extend into a PWA later.
- Adopt **Biome** (formatter + linter) instead of ESLint/Prettier to keep a single config file, benefit from autofixes (e.g., security/a11y rules), and enforce consistent formatting via `pnpm lint` / `pnpm format` scripts.
- Add **React Router DOM** now to support the future layout shell/routing work without reworking the foundation later.

## Alternatives
- **npm or yarn**: rejected because pnpm offers better determinism and disk usage, and npm repeatedly failed to reach the registry in this environment.
- **ESLint + Prettier**: heavier config surface and duplicate AST parsing; swapping to Biome gives faster checks and fewer configs to maintain.
- **CRA/Next.js**: CRA is deprecated; Next.js brings server-side assumptions we do not need for a client-first PWA.

## Consequences
- All scripts (`pnpm dev`, `pnpm lint`, `pnpm format`, `pnpm build`) depend on pnpm being available locally and in CI/CD.
- Biome formatting decisions (semicolons, import ordering) shape code style automatically; contributors should rely on `pnpm format` before committing.
- React Router is available from the start, so upcoming layout/routing tasks can focus on UX instead of plumbing.
- Future ADRs can reference this record when introducing new tooling (e.g., testing, Tailwind) for traceability.
