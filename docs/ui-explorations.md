# UI Refresh Explorations — January 2025

Goal: break down the pending UI polish work into concrete, bite-sized stories before execution. Each section below captures the current experience, user pain, and a proposal/acceptance note so we can scope implementation tasks.

## 1. Dedicated Loading State Before Forecast Sync
- **Current state:** `HomeShell` renders immediately with default mock data while `useForecastForLocation` fetches; only sub-panels show skeletons (`src/App.tsx:225`, `src/App.tsx:405`). There is no global loading treatment, so users briefly see stale hero/planning copy until Open-Meteo resolves.
- **Pain:** Users may assume the default mock is their real forecast, especially on cold starts or slow connections.
- **Proposal:** Introduce an app-level loading screen (full-bleed gradient or frosted panel) that holds focus until `forecastStatus === 'success'` for the selected location. Fade into the full layout once data lands to reinforce “live” state. Acceptance: hero headline should not show mock city when first loading device-based coordinates; show skeleton CTA + spinner and an accessible `aria-busy` on `<main>`.

## 2. Respect Native Units From Open-Meteo
- **Current state:** We coerce Open-Meteo’s Celsius/metric output to Fahrenheit and mph via helpers (`celsiusToFahrenheit`, `kilometersPerHourToMiles`) and render `%` labels regardless of locale (`src/App.tsx:330`).
- **Pain:** International users expect the provider’s native units (or at least a toggle). Our conversions also drop precision and may not match displayed units elsewhere in the app.
- **Proposal:** Accept the provider’s configured units (Open-Meteo already lets us request `temperature_unit`, `windspeed_unit`, etc.) and display them verbatim, showing the unit suffix from the API metadata. Acceptance: hero + hourly + daily cards should display whatever units the forecast call requests (metric by default) and include a future hook for switching units.

## 3. Reduce Cognitive Load in the Hero Card
- **Current state:** The hero surface stacks vibe label, 94px temp, description, feels-like/high/low line, summary paragraph, vibe tags, three metrics, and refresh controls (`src/App.tsx:150-190`). Planning tiles + info cards repeat similar copy.
- **Pain:** Too many text blocks compete for attention; the vibe summary duplicates body copy and tags already appear on both hero and side card.
- **Proposal:** Split the hero into two layers: (1) temperature + concise condition/vibe chip; (2) secondary data (feels-like, high/low, location). Move extended summary + tags exclusively into the side VibeSummaryCard. Acceptance: hero should contain at most three text lines below the temperature plus one button (Refresh) and a compact stats row.

## 4. Palette Exploration (Lighter Blues)
- **Current state:** Root tokens favor deep navy backgrounds (`--color-surface-base: #050816`, `--color-surface-raised: #0e1426`) making the entire UI feel heavy (`src/index.css:6`).
- **Pain:** Users noted the shell reads as “stormy” even during calm vibes; cards lack contrast against the dark base, and gradients are mostly dark.
- **Proposal:** Explore a lighter base palette (ice blue / slate) while keeping frosted treatment. Update Tailwind tokens to new surface/background colors, evaluate gradient presets per vibe, and ensure AA contrast. Acceptance: produce at least two palette mockups (light/cool + neutral) and document the chosen hex tokens before coding.

## 5. Typography Refresh
- **Current state:** Display font uses Space Grotesk, body uses Inter (`src/index.css:6`). We rely on Tailwind classes but no custom tracking/line-height beyond hero.
- **Pain:** The geometric display font + all-caps tracking feels rigid; spacing inconsistencies show up across cards.
- **Proposal:** Audit new font pairings (e.g., `Clash Display` + `General Sans` or `Satoshi`). Define an updated scale (e.g., display-xl, heading-lg, body-md) and map to Tailwind theme for consistency. Acceptance: document font choices, fallback stack, and scale in this file; update theme tokens accordingly in the implementation phase.

## 6. Simplify Navigation (Remove Tabs Until Needed)
- **Current state:** Header shows three NavLink pills (Forecast, Locations, Insights) but only home/locations have real UI, and insights is a placeholder (`src/App.tsx:15-47`).
- **Pain:** Extra tabs create cognitive noise and imply unfinished sections.
- **Proposal:** Collapse to a single “Locations” affordance (icon button or dropdown) while defaulting the header to a single “Forecast” view. Consider moving future Insights entry into the planning area until ready. Acceptance: new navigation spec should define desktop + mobile behavior, keyboard access, and how location switching is exposed without a full page.

## Next Steps
- Prioritize delivering the loading + palette decisions first so the remaining tasks inherit the new art direction.
- Convert each proposal above into individual tickets with design references before coding.
