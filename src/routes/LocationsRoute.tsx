import { useState } from 'react';
import { useLocationService } from '../features/location/locationContext.tsx';
import type { LocationSnapshot } from '../features/location/types.ts';

export function LocationsRoute() {
  const {
    state: { recentLocations, selectedLocation, status, error },
    search,
    selectLocation,
    detectLocation,
  } = useLocationService();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSnapshot[]>([]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setResults(value ? search(value) : []);
  };

  const handleSelect = (location: LocationSnapshot) => {
    selectLocation(location);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="grid gap-space-lg lg:grid-cols-[2fr_1fr]">
      <section className="frosted-panel rounded-emphasis border border-surface-outline/60 p-space-lg shadow-card">
        <p className="text-sm uppercase tracking-[0.35em] text-text-muted">Choose your anchor</p>
        <h1 className="mt-space-xs font-display text-display-md text-brand-zenith">
          Saved locations
        </h1>
        <p className="text-body-lg text-text-secondary">
          Set your default vibe location or quick-switch between recent microclimates.
        </p>

        <div className="mt-space-lg space-y-space-sm">
          <label className="text-sm font-semibold text-text-primary" htmlFor="location-search">
            Search city or neighborhood
          </label>
          <input
            id="location-search"
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="e.g., Brooklyn, Austin, Portland"
            data-testid="location-search-input"
            className="w-full rounded-2xl border border-surface-outline/80 bg-transparent px-space-md py-space-2xs text-body-lg text-text-primary placeholder:text-text-muted focus:border-brand-zenith focus:outline-none"
          />
          {query && (
            <div className="rounded-2xl border border-surface-outline/60 bg-surface-raised">
              {results.length > 0 ? (
                <ul>
                  {results.map((location) => (
                    <li key={location.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(location)}
                        data-testid="location-search-result"
                        className="flex w-full items-start justify-between gap-space-xs border-b border-surface-outline/50 px-space-md py-space-xs text-left hover:bg-surface-base/60 last:border-b-0"
                      >
                        <div>
                          <p className="font-semibold text-text-primary">{location.name}</p>
                          <p className="text-body-sm text-text-secondary">
                            {location.region}, {location.country}
                          </p>
                        </div>
                        <span className="text-xs uppercase tracking-widest text-brand-zenith">
                          set
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-space-md py-space-xs text-body-sm text-text-muted">
                  No matches yet. Try another city or landmark.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-space-lg">
          <p className="text-sm font-medium uppercase tracking-[0.4em] text-text-muted">
            Recent spots
          </p>
          <div className="mt-space-xs flex flex-wrap gap-space-2xs">
            {recentLocations.map((location) => (
              <button
                key={location.id}
                type="button"
                className={`rounded-full border px-space-sm py-space-2xs text-sm ${
                  selectedLocation.id === location.id
                    ? 'border-brand-sunrise text-brand-sunrise'
                    : 'border-surface-outline/70 text-text-secondary'
                }`}
                onClick={() => handleSelect(location)}
                data-testid="recent-location-chip"
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-space-sm">
        <article className="rounded-3xl border border-surface-outline/60 bg-surface-raised p-space-lg">
          <h2 className="font-display text-2xl text-text-primary">Use device location</h2>
          <p className="mt-space-xs text-body-sm text-text-secondary">
            Tap to try browser geolocation and snap to the closest mock city.
          </p>
          <button
            type="button"
            onClick={detectLocation}
            className="mt-space-sm rounded-full border border-brand-zenith/60 bg-brand-zenith/10 px-space-md py-space-2xs text-sm font-semibold text-brand-zenith hover:bg-brand-zenith/20"
          >
            {status === 'locating' ? 'Locating...' : 'Use current location'}
          </button>
          {error ? <p className="mt-space-2xs text-body-sm text-brand-sunrise">{error}</p> : null}
        </article>

        <article className="rounded-3xl border border-surface-outline/60 bg-surface-raised p-space-lg">
          <h2 className="text-sm uppercase tracking-[0.35em] text-text-muted">Currently pinned</h2>
          <p
            className="mt-space-xs font-display text-2xl text-brand-zenith"
            data-testid="pinned-location-name"
          >
            {selectedLocation.name}
          </p>
          <p className="text-body-sm text-text-secondary">{selectedLocation.summary}</p>
          <p className="mt-space-xs text-body-sm text-text-muted">
            {selectedLocation.region}, {selectedLocation.country}
          </p>
        </article>
      </aside>
    </div>
  );
}
