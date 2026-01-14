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
- **Exploration (Feb 2025):**
  - *Cool Mist* (implemented) — airy, ice-blue base for the shell while keeping saturated gradients for hero/CTAs. Tokens: `surface.base #E8F1FF`, `surface.raised #F8FBFF`, `surface.outline rgba(15,23,42,0.14)`, `surface.overlay rgba(255,255,255,0.78)`, `text.primary #0F1A2B`, `text.secondary rgba(15,26,43,0.78)`, `text.muted rgba(15,26,43,0.58)`, gradients refreshed to lighter blues/corals.
- *Soft Neutral* (backlog) — warmer parchment base (`surface.base #F5EFE6`, `surface.raised #FFFBF5`) paired with desaturated lilac gradients. Parking this option for a future seasonal theme.
- **Decision:** Adopt the Cool Mist palette and update the CSS custom properties/Tailwind tokens (`src/index.css`, `tailwind.config.ts`). Cards now sit on a light icy backdrop, the frosted glass overlay uses translucent white, and hero gradients were refreshed (`--gradient-vibe-*`) to maintain contrast for white hero text.
- **Accessibility follow-up (Feb 2025):** Brightened `surface.base` to `#F5F8FF`, set `surface.raised` to `#FFFFFF`, introduced a `--color-text-inverse` token, and converted pills/alerts to filled chips so all text-on-background pairs meet WCAG 2.1 AA (≥4.5:1 for body text).
- **iOS alignment (Feb 2025):** After testing the lighter shell in situ, reverted to a dark navy base that mirrors Apple Weather (deep blue gradient background, white type, frosted navy cards). Tokens now use `surface.base #050C1F`, `surface.raised #101C3A`, and hero gradients pull from the iOS temperature palette so the main temperature block, hero status, and loading screen keep white text without legibility issues.

## Accessibility & Contrast Notes
- Default text now uses near-white (`#F4F7FF`) on the deep navy base for ~14:1 contrast.
- All "brand" CTAs (Share vibe, device location, alert banners) flip to solid brand backgrounds with `--color-text-inverse` (navy) so pills mimic iOS Weather while staying readable.
- Chips and tags gained either frosted navy outlines or filled brand states. Avoid outline-only treatments unless text remains ≥4.5:1.
- Hero + loading gradients mirror the iOS palette (deep blue → cyan) so the temperature, description, and vibe label all use white text with sufficient luminance contrast.

## 5. Typography Refresh
- **Current state:** Display font uses Space Grotesk, body uses Inter (`src/index.css:6`). We rely on Tailwind classes but no custom tracking/line-height beyond hero.
- **Pain:** The geometric display font + all-caps tracking feels rigid; spacing inconsistencies show up across cards.
- **Proposal:** Audit new font pairings (e.g., `Clash Display` + `General Sans` or `Satoshi`). Define an updated scale (e.g., display-xl, heading-lg, body-md) and map to Tailwind theme for consistency. Acceptance: document font choices, fallback stack, and scale in this file; update theme tokens accordingly in the implementation phase.
- **Update (Feb 2025):** Adopted Apple-inspired stacks (`SF Pro Display` + `SF Pro Text` with `Inter` fallbacks) via CSS variables and refreshed the Tailwind scale. New tokens: `display-2xl`→`display-md` (hero/section headers), `heading-xl`→`heading-sm` (card titles), and `body-lg/body-md/body-sm/body-xs` plus an `eyebrow` style for pills. All key components now use the semantic classes so typography stays consistent with iOS Weather expectations.

## 6. Simplify Navigation (Remove Tabs Until Needed)
- **Current state:** Header shows three NavLink pills (Forecast, Locations, Insights) but only home/locations have real UI, and insights is a placeholder (`src/App.tsx:15-47`).
- **Pain:** Extra tabs create cognitive noise and imply unfinished sections.
- **Proposal:** Collapse to a single “Locations” affordance (icon button or dropdown) while defaulting the header to a single “Forecast” view. Consider moving future Insights entry into the planning area until ready. Acceptance: new navigation spec should define desktop + mobile behavior, keyboard access, and how location switching is exposed without a full page.

## Next Steps
- Prioritize delivering the loading + palette decisions first so the remaining tasks inherit the new art direction.
- Convert each proposal above into individual tickets with design references before coding.
