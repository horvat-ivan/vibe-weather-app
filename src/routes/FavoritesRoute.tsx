import { useLocationService } from '../features/location/locationContext.tsx';

export function FavoritesRoute() {
  const {
    state: { favoriteLocations, selectedLocation },
    selectLocation,
    toggleFavorite,
  } = useLocationService();

  return (
    <section className="space-y-space-md">
      <header>
        <p className="text-sm uppercase tracking-[0.35em] text-text-muted">Favorite cities</p>
        <h1 className="mt-space-xs font-display text-display-md text-brand-zenith">Favorites</h1>
        <p className="text-body-lg text-text-secondary">
          Pin your go-to spots for faster switching and planning.
        </p>
      </header>
      {favoriteLocations.length ? (
        <ul className="space-y-space-sm" data-testid="favorite-list">
          {favoriteLocations.map((location) => (
            <li
              key={location.id}
              className="flex flex-col gap-space-2xs rounded-3xl border border-surface-outline/60 bg-surface-raised p-space-lg md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-display text-heading-lg text-text-primary">{location.name}</p>
                <p className="text-body-sm text-text-secondary">
                  {location.region}, {location.country}
                </p>
                <p className="text-body-xs text-text-muted">{location.summary}</p>
              </div>
              <div className="flex gap-space-2xs">
                <button
                  type="button"
                  className={`rounded-full px-space-md py-space-2xs text-sm font-semibold transition ${
                    selectedLocation.id === location.id
                      ? 'bg-brand-sunrise text-[var(--color-text-inverse)]'
                      : 'border border-brand-zenith/50 text-brand-zenith hover:bg-brand-zenith/10'
                  }`}
                  onClick={() => selectLocation(location)}
                >
                  {selectedLocation.id === location.id ? 'Pinned' : 'Pin'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(location)}
                  className="rounded-full border border-surface-outline/60 px-space-md py-space-2xs text-sm text-text-muted transition hover:bg-surface-base/70"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl border border-dashed border-surface-outline/60 p-space-xl text-center">
          <p className="font-display text-heading-lg text-text-primary">No favorites yet</p>
          <p className="mt-space-xs text-body-sm text-text-secondary">
            Save a city from the hero card to see it here.
          </p>
        </div>
      )}
    </section>
  );
}
