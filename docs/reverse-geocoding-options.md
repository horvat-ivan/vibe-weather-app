# Reverse Geocoding Options — Notes

## Why the fallback list exists
- The CLI sandbox and some corporate networks block access to `geocoding-api.open-meteo.com`, triggering DNS failures even though the production API is public.
- During earlier testing the LocationProvider would throw when reverse geocoding failed, leaving the pinned city stuck; we added a curated fallback list (Zagreb, Paris, etc.) to keep UX functional while offline.
- The list is a stopgap. In a real deployment we should rely on an API with an uptime guarantee or host our own lookup service so we do not need to ship static coordinates.

## Candidate providers
| Provider | Pros | Cons |
| --- | --- | --- |
| **Open-Meteo Geocoding** (current) | Free, no API key, aligned with existing weather provider (same lat/lon + timezone fields). | No SLA; DNS blocked in some sandboxes; lacks fuzzy results for uncommon places; reverse endpoint can be slow. |
| **BigDataCloud Reverse Geocoding** | Free tier (10k/day) with detailed locality info, good EU coverage, supports HTTPS + CORS reliably. | Requires API key, terms require attribution, paid tiers for commercial use. |
| **OpenCage Data** | Mature API with caching guidance, well-documented, generous free tier for dev/testing. | API key + daily quota (2,500 free); must attribute and cache carefully; paid for production scale. |
| **Mapbox Geocoding** | High accuracy worldwide, great autocomplete + reverse geocoding, strong SLAs. | Requires account + API key; billable per request; ToU restrict caching. |
| **HERE Geocoder API** | Enterprise-grade uptime, multi-language support, event-based pricing. | Requires account + API key; ToU complexity; may be overkill for MVP. |
| **Self-hosted Pelias or Photon** | Full control, can preload OpenStreetMap data, no per-request costs after hosting. | Operational overhead (ingest, hosting, updates); not practical until traffic justifies it. |

## Recommendation
1. **Short term (MVP/dev)**: Keep Open-Meteo but expand the fallback list only for regions we actively test (to avoid bloating bundles). Document that offline/dev environments rely on fallbacks.
2. **Medium term**: Evaluate BigDataCloud or OpenCage for production, since both offer generous free tiers, better uptime, and return human-readable locality/country names. We can hide the key via a lightweight proxy or store it in env config.
3. **Long term**: If we need enterprise SLAs or autocomplete parity with mobile weather apps, migrate to Mapbox/HERE or run our own Pelias deployment, but that requires extra budget + ops work.

## Next steps when we tackle this
- Decide whether we need forward geocoding (search) + reverse geocoding from the same provider; if yes, pick one API that does both to avoid data drift.
- Wrap the chosen provider in a single client module with retries and caching so the LocationProvider doesn’t need the fallback list.
- Update ADR/technical plan once the provider is selected and wired up.
