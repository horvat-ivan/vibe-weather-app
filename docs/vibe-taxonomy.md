# Vibe Taxonomy & Rule Matrix

The guidance layer translates raw forecast data into a handful of clearly defined vibes. Each vibe maps to wardrobe cues, activity nudges, and caution notes so we can render cards without bespoke copywriting per city. The matrix is intentionally small for now so it can be extended without rewriting the engine.

## Core Categories

| ID | Name | Summary | Typical Wardrobe | Activity Lean | Alerts |
| --- | --- | --- | --- | --- | --- |
| `storm-mode` | Storm Mode | High precipitation probability or severe weather codes trigger an all-eyes-on-alert state focused on shelter + indoor planning. | Waterproof layers, sealed footwear, stashable umbrella. | Indoor routines, transit padding, reschedule outdoor plans. | Wind gusts, lightning, and pooling alerts with push hooks later. |
| `heatwave` | Heatwave Pulse | Extreme temperatures (>92°F feels-like) with dry-to-moderate humidity. | Breathable natural fibers, cooling accessories, hydration reminders. | Early-morning errands, shaded routes, rooftop plans after sunset. | Heat advisories, hydration cadence, avoid heavy exertion. |
| `humid-haze` | Humid Haze | Warm (>78°F) and humid (>70%) setups without storm risk, usually muggy evenings. | Linen/tech fabrics, anti-frizz cues, electrolyte plans. | Indoor/outdoor mix with breaks, prioritize waterfront breezes. | Watch for pop-up storms, hydrate, check transit comfort. |
| `wind-shift` | Wind Shift | Sustained winds >= 20 mph regardless of temp — comfort hinges on wind protection. | Windbreakers, secure hats, eyewear for debris. | Boardwalk walks, kite spots, avoid loose patio setups. | Gust + debris caution, transit buffering. |
| `coastal-glow` | Coastal Glow | Mild (60–75°F) with low precip (<25%) and moderate humidity (<70%). | Light layers, sunglasses, coastal-friendly footwear. | Outdoor work sessions, coffee walks, seaside errands. | UV reminders + marine layer timing. |
| `crisp-active` | Crisp Active | Cool-but-energizing band (50–65°F), low humidity (<55%), low precip. | Layered knits, light jackets, comfortable sneakers. | Jogging, cycling, errand stacking, productivity sprints. | Track overnight lows for plant care + windows. |
| `layered-chill` | Layered Chill | Cold (<50°F) regardless of humidity — focus on insulation. | Insulated layers, scarves, gloves. | Cozy indoor focus, short outdoor hops with layers. | Frost + black-ice mentions when humidity/precip >40%. |
| `default-balance` | Balanced Blend | Catch-all for everything not claimed above. | Versatile layers, comfortable footwear. | Balanced schedule, mix of indoor/outdoor. | Standard forecast reminders. |

## Rule Evaluation Order

Rules are evaluated from highest priority (alerts) down to the default catch-all. Once a rule matches it yields a `VibeProfile` with structured copy.

1. `storm-mode`: precipitation probability ≥ 70% **or** weather code in the thunder/rain buckets.
2. `heatwave`: feels-like ≥ 92°F.
3. `humid-haze`: temperature ≥ 78°F **and** humidity ≥ 70%.
4. `wind-shift`: wind ≥ 20 mph.
5. `coastal-glow`: 60–75°F, humidity ≤ 70%, precip ≤ 25%.
6. `crisp-active`: 50–65°F, humidity ≤ 55%, precip ≤ 30%.
7. `layered-chill`: temperature < 50°F.
8. `default-balance`: fallback when nothing else matches.

## Output Contract

Every vibe exposes the following data:

- `name` + `tagline`: short copy for hero/tags.
- `summary`: one-liner summarizing conditions.
- `tags`: up to three micro-labels for chips.
- `wardrobe`, `activities`, `alerts`: body copy for planning cards.

The engine lives in `src/features/vibe` and accepts normalized Fahrenheit + percentage inputs (humidity/precip). Future work can extend the taxonomy or layer localization without touching the consuming components.
