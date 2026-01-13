# Vibe Weather App — UI Refresh Plan

## Overview
Phase 5 introduces a lower-priority track to uplift the interface so it feels closer to best-in-class native weather apps on iOS and Android. The refresh is primarily a design/UX initiative that should be completed (at least in docs and prototypes) before any major engineering tickets are pulled. This document records concrete goals, scope, and acceptance criteria so designers and engineers share the same expectations.

## Goals
1. Make the overall experience feel familiar to users of Apple Weather, Carrot, and Google Weather while preserving Vibe Weather’s personality.
2. Increase usability by clarifying the hierarchy between current conditions, hourly trends, daily outlook, and vibe guidance.
3. Improve touch ergonomics and affordances for quick actions (location switcher, favorites, alerts, share).
4. Reinforce trust through polished typography, iconography, and motion cues that match platform conventions.

## Non-Goals
- Rewriting the vibe engine logic or guidance rules; the refresh only changes presentation.
- Adding new data sources or long-range forecast types beyond the existing roadmap.
- Building a fully custom theming system (light/dark mode parity is expected but not brand-new skins).

## Experience Principles
- **Platform-native rhythm**: Mirror iOS/Android typography scale (e.g., SF Pro/Roboto equivalents), icon sizing (24/32/48px), and spacing increments (4/8/12).
- **Glanceable hierarchy**: Primary hero answers “What’s it feel like right now?”; secondary track highlights upcoming hours; tertiary cards cover guidance and alerts.
- **Card-first layout**: Use rounded, elevated modules with consistent padding, making each block thumb-accessible and reorderable on mobile.
- **Friendly motion**: Apply micro-transitions (fade/slide) for loading and forecast updates with durations under 250ms and easing that mirrors iOS (easeOutCubic) / Material (standard curve).
- **Resilient states**: Loading, offline, and error surfaces should visually align with the refreshed cards (skeletons, banners, toasts).

## Target Platforms & Breakpoints
- **Mobile portrait (360–430px)**: Primary target, mirrors native weather apps.
- **Small tablets / large phones (600–834px)**: Enable dual-column layout for hero + hourly vs. guidance cards.
- **Desktop (≥1024px)**: Maintain responsive grid but keep mobile-friendly interactions.

## Scope & Deliverables
1. **Design reference mocks**
   - High-fidelity mockups for iOS and Android breakpoints covering hero, hourly, daily, vibe summary, guidance, alerts, favorites panel, and offline states.
   - Motion specs (storyboards or short GIFs) for key transitions.
2. **Component specs**
   - Annotated documentation for each redesigned module (padding, typography tokens, states, gestures).
   - Asset lists for updated icons/illustrations (SVG/Lottie) with ownership.
3. **Engineering handoff materials**
   - Updated Figma component names mapped to code components.
   - Acceptance criteria + test notes (visual regression, accessibility, performance budgets).

## Module Requirements
### 1. Current Conditions Hero
- Full-width card with gradient background that adapts to vibe category.
- Shows current temp, feels like, condition icon, vibe tag, and short copy (“Warm + breezy — perfect gallery-hopping”).
- Includes quick actions: refresh, share, add to favorites (icons sized 28–32px, minimum 44px tap target).
- Animates temp change with count-up/down effect on refresh.

### 2. Hourly Timeline
- Scrollable chip-style timeline with 4-hour peek visible, drag to reveal remaining hours.
- Chips show time, icon, temp, precipitation chance; highlight the current hour.
- Introduce subtle scrollbar/rail for Android, bounce hint for iOS.
- Long-press reveals detail drawer (wind, humidity) without navigating away.

### 3. Daily Outlook Cards
- Stack of cards with accordion expand/collapse for extended details.
- Include sunrise/sunset row, precipitation bars, “vibe delta” comparing to today.
- Support pinned severe weather indicator (badge + color change) when alerts exist.

### 4. Vibe Summary Card
- Dedicated card with custom illustration/icon matching vibe taxonomy.
- Contains 2–3 bullet sentiments plus CTA to view guidance.
- Includes share/export button and accessible description text for screen readers.

### 5. Guidance & Activity Modules
- Horizontal carousel of cards (clothing, activity, alerts) with snap points.
- Each card includes icon, title, detail text, and severity pill (info/heads-up/urgent).
- Provide skeleton state that mimics final card layout.

### 6. Location & Favorites Controls
- Persistent location pill at top with chevron to open sheet.
- Favorites view uses list of cards with thumbnail map/icon; can reorder via drag handle.
- Manual search uses sticky search bar with material-style suggestions.

### 7. Alerts & System States
- Global banner style for offline/poor network (icons + CTA to retry).
- Toast pattern for saved favorite/share success.
- Empty states for no favorites, no data, etc., with friendly illustration.

### 8. Motion & Feedback
- Document entry/exit animations for hero, hourly timeline, carousels.
- Specify haptic feedback guidance for native wrappers (if later wrapped) but fall back to visual cues on web.

## Visual System Updates
- **Typography**: Adopt updated scale (Display 32/36, Title 24, Heading 20, Body 16, Caption 14) with platform-appropriate font stack.
- **Color & Gradients**: Expand vibe-based gradient tokens (e.g., `gradient-cozy`, `gradient-electric-storm`). Outline contrast ratios for text overlays.
- **Iconography**: Align stroke/filled icons to 2px stroke; ensure weather + action icons share consistent style.
- **Spacing**: Standardize to 4px base grid; define padding sets (16, 20, 24) for cards.

## Accessibility & Performance
- Maintain WCAG AA contrast for text/button overlays on gradients.
- Provide focus states for keyboard nav (box-shadow ring) even on card layouts.
- Motion reduced preference should disable non-essential animations.
- Performance budgets: hero gradient + Lottie animations must not push main thread >100ms on mid-tier devices.

## Acceptance Criteria
- Side-by-side comparison with Apple Weather / Google Weather shows comparable information density and clarity (design review sign-off).
- Usability test with 5 existing testers reports improved ease-of-use for switching locations and reading guidance.
- All redesigned components documented with props/states in Storybook (or equivalent) prior to code merge.
- Accessibility checklist complete (contrast, keyboard, screen reader labels) for hero, hourly, vibe, guidance, alerts.

## Dependencies & Risks
- Requires updated icon/illustration assets (coordination with design/brand).
- Motion specs depend on finalizing Lottie/JSON exports.
- Potential rework of Tailwind theme tokens; ensure no regressions to existing styles before migration plan is ready.

## Open Questions
1. Do we introduce theming variations for day/night automatically or keep a single palette per vibe?
2. Should the refresh include haptic feedback hooks for future native wrappers?
3. Do we need localization-ready typography adjustments (e.g., CJK fonts) at this stage?
4. Will the favorites view remain full-screen modal on mobile or shift to bottom sheet?

## Next Steps
1. Finalize design mocks + motion studies referencing this spec.
2. Update technical plan once UI architecture impacts are known (e.g., new component tree, animation libs).
3. Break work into engineering tickets (hero, hourly, cards, navigation) with estimates once assets are signed off.

## Implementation Log — January 2025
- **Hero refresh**: Rebuilt the current-conditions hero to mirror iOS Weather’s hierarchy — oversized temperature glyph, single-line feel-like/high-low copy, and subdued gradient background tied to each vibe. Quick action clusters were removed in favor of a single refresh button and a concise “updated” timestamp so the card reads at a glance.
- **Hourly timeline**: Chips now follow the native pattern (time, icon, temp, precip) with a muted rail and the active hour highlighted; glyphs map directly from Open-Meteo weather codes so parity with Apple Weather icons is straightforward once custom assets land.
- **Daily outlook**: Rows emphasize weekday, sunrise/sunset, rain chance, and a simple “warmer/cooler than today” delta to keep the copy terse while matching iOS typography scale. These refinements keep the layout touch-friendly while aligning with the refresh goals above and will serve as the baseline for future motion/asset polish.
