import { NavLink, Route, Routes } from 'react-router-dom';
import { Logo } from './components/Logo.tsx';
import { NetworkAwareShell } from './components/NetworkAwareShell.tsx';
import { LocationProvider, useLocationService } from './features/location/locationContext.tsx';
import { deriveVibeProfile } from './features/vibe/vibeEngine.ts';
import type { OpenMeteoForecastResponse } from './features/weather/openMeteoClient.ts';
import { useForecastForLocation } from './features/weather/useForecast.ts';
import { FavoritesRoute } from './routes/FavoritesRoute.tsx';
import { LocationsRoute } from './routes/LocationsRoute.tsx';

function Header() {
  return (
    <header className="border-b border-surface-outline/60 bg-surface-raised/80 backdrop-blur supports-[backdrop-filter]:bg-surface-raised/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-space-lg py-space-sm">
        <Logo variant="mark" size={44} />
        <nav className="flex items-center gap-space-xs" aria-label="Primary">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-space-sm py-space-2xs text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-brand-sunrise text-[var(--color-text-inverse)]'
                  : 'text-text-secondary hover:bg-surface-raised/70'
              }`
            }
          >
            Forecast
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `rounded-full px-space-sm py-space-2xs text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-brand-sunrise text-[var(--color-text-inverse)]'
                  : 'text-text-secondary hover:bg-surface-raised/70'
              }`
            }
            aria-label="Favorite locations"
          >
            Favorites
          </NavLink>
          <NavLink
            to="/locations"
            data-testid="header-location-switcher"
            className={({ isActive }) =>
              `flex items-center gap-space-3xs rounded-full px-space-sm py-space-2xs text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? 'bg-brand-zenith/90 text-[var(--color-text-inverse)]'
                  : 'text-brand-zenith border border-brand-zenith/50 hover:bg-brand-zenith/10'
              }`
            }
            aria-label="Manage locations"
          >
            <span aria-hidden>📍</span>
            <span>Locations</span>
          </NavLink>
        </nav>
        <button
          type="button"
          className="rounded-full border border-brand-zenith/70 bg-brand-zenith px-space-sm py-space-2xs text-sm font-semibold text-[var(--color-text-inverse)] shadow-sm transition hover:brightness-110"
        >
          Share vibe
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-surface-outline/60 bg-surface-base/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-space-2xs px-space-lg py-space-sm text-body-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Vibe Weather Labs.</p>
        <p>Beta planning shell — forecasts simulated for design.</p>
      </div>
    </footer>
  );
}

function HomeShell() {
  const {
    state: { selectedLocation, status, error, favoriteLocations },
    detectLocation,
    toggleFavorite,
  } = useLocationService();
  const {
    status: forecastStatus,
    data: forecast,
    error: forecastError,
    updatedAt: forecastUpdatedAt,
    refresh: refreshForecast,
    hasEverResolved,
  } = useForecastForLocation(selectedLocation);
  const isInitialLoading = forecastStatus === 'loading' && !hasEverResolved;
  const isFavorite = favoriteLocations.some((location) => location.id === selectedLocation.id);
  if (isInitialLoading) {
    const fallbackTheme = getVibeTheme(selectedLocation.vibe);
    return (
      <div className="flex flex-col gap-space-xl" aria-busy="true">
        <ForecastLoadingScreen
          gradient={fallbackTheme.gradient}
          locationName={selectedLocation.name}
          region={selectedLocation.region}
        />
      </div>
    );
  }

  const currentConditions = deriveCurrentConditions(forecast, selectedLocation.timezone);
  const fallbackTemperature = createMeasurement(selectedLocation.heroTemperature, '°F');
  const fallbackFeelsLike = createMeasurement(selectedLocation.heroFeelsLike, '°F');
  const heroTemperature = currentConditions?.temperature ?? fallbackTemperature;
  const heroFeelsLike = currentConditions?.feelsLike ?? fallbackFeelsLike;
  const heroDescription = currentConditions?.description ?? selectedLocation.condition;
  const heroMetrics = currentConditions
    ? [
        {
          label: 'Humidity',
          value: formatMeasurement(currentConditions.humidity),
          detail: 'Relative humidity',
        },
        {
          label: 'Wind',
          value: formatMeasurement(currentConditions.windSpeed),
          detail: 'Steady breeze',
        },
        {
          label: 'Precip',
          value: formatMeasurement(currentConditions.precipProbability),
          detail: 'Chance of rain',
        },
      ]
    : selectedLocation.metrics;

  const hourlyPoints = buildHourlyPoints(forecast, selectedLocation.timezone).slice(0, 8);
  const dailyPoints = buildDailyPoints(forecast, selectedLocation.timezone).slice(0, 5);
  const heroTempF = measurementToFahrenheit(heroTemperature);
  const heroFeelsLikeF = measurementToFahrenheit(heroFeelsLike);
  const vibeProfile = deriveVibeProfile({
    temperatureF: heroTempF,
    feelsLikeF: heroFeelsLikeF,
    humidity: currentConditions?.humidity.value ?? null,
    precipProbability: currentConditions?.precipProbability.value ?? null,
    windMph: currentConditions?.windSpeed.value ?? null,
    weatherCode: forecast?.current_weather?.weathercode ?? null,
  });
  const vibeLabel = vibeProfile?.name ?? selectedLocation.vibe;
  const vibeTheme = getVibeTheme(vibeLabel);
  const vibeTags = vibeProfile?.tags?.length ? vibeProfile.tags : selectedLocation.tags;
  const planningTiles = vibeProfile
    ? [vibeProfile.wardrobe, vibeProfile.activities, vibeProfile.alerts]
    : selectedLocation.planning;
  const locationSummary = vibeProfile?.summary ?? selectedLocation.summary;
  const vibeSummaryHeading = vibeProfile ? "Today's vibe" : 'Pinned vibe';
  const vibeSummaryContent = vibeProfile
    ? {
        title: vibeProfile.name,
        tagline: vibeProfile.tagline,
        summary: vibeProfile.summary,
        icon: vibeProfile.icon,
      }
    : {
        title: selectedLocation.vibe,
        tagline: selectedLocation.condition,
        summary: selectedLocation.summary,
        icon: null,
      };
  const currentWeather = forecast?.current_weather;
  const liveForecastCopy = (() => {
    if (forecastStatus === 'loading' && !currentWeather) {
      return 'Syncing the latest conditions from Open-Meteo...';
    }

    if (currentWeather) {
      const temperatureUnit =
        forecast?.current_weather_units?.temperature ??
        forecast?.hourly_units?.temperature_2m ??
        '°C';
      const windUnit =
        forecast?.current_weather_units?.windspeed ??
        forecast?.hourly_units?.windspeed_10m ??
        'km/h';
      const temperature = formatMeasurement(
        createMeasurement(currentWeather.temperature, temperatureUnit),
      );
      const wind = formatMeasurement(createMeasurement(currentWeather.windspeed, windUnit));
      return `${temperature} now with ${wind} winds.`;
    }

    return 'Live conditions will appear after the first sync.';
  })();

  const updatedLabel = forecastUpdatedAt
    ? formatUpdatedTime(forecastUpdatedAt, selectedLocation.timezone)
    : null;
  const todayHigh = dailyPoints[0]?.high ?? heroTemperature;
  const todayLow = dailyPoints[0]?.low ?? heroFeelsLike;

  return (
    <div className="flex flex-col gap-space-xl" aria-busy={forecastStatus === 'loading'}>
      <section className="grid gap-space-lg lg:grid-cols-[1.8fr_1fr]">
        <article
          className="rounded-[32px] border border-white/5 p-space-xl text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
          style={{ backgroundImage: vibeTheme.gradient }}
        >
          <div className="space-y-space-2xs">
            <div className="flex items-center justify-between text-[13px] uppercase tracking-[0.35em] text-white/70">
              <p>Now</p>
              <span
                data-testid="hero-vibe-label"
                className="rounded-full border border-white/30 px-space-sm py-space-3xs text-[11px] font-semibold uppercase tracking-[0.35em] text-white"
              >
                {vibeLabel}
              </span>
            </div>
            <p
              className="font-display text-[94px] font-light leading-[0.85]"
              data-testid="hero-temperature"
            >
              {formatMeasurement(heroTemperature)}
            </p>
            <p className="text-heading-lg text-white/90" data-testid="hero-description">
              {heroDescription}
            </p>
            <p className="text-base text-white/85" data-testid="hero-feels-like">
              Feels like {formatMeasurement(heroFeelsLike)} · H:{formatMeasurement(todayHigh)} · L:
              {formatMeasurement(todayLow)}
            </p>
            <p className="text-sm text-white/75">
              {selectedLocation.name}, {selectedLocation.region} ·{' '}
              {updatedLabel ? `Updated ${updatedLabel}` : 'Syncing latest data'}
            </p>
          </div>
          <div className="mt-space-lg flex flex-wrap gap-space-xl text-sm text-white/90">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="text-[13px] uppercase tracking-[0.3em] text-white/70">
                  {metric.label}
                </span>
                <span className="text-xl font-semibold">{metric.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-2xs text-sm text-white/80">
            <p>Updated {updatedLabel ?? 'just now'}</p>
            <div className="flex gap-space-2xs">
              <button
                type="button"
                onClick={refreshForecast}
                disabled={forecastStatus === 'loading'}
                className="rounded-full border border-white/30 px-space-md py-space-2xs text-white/90 transition hover:bg-white/10 disabled:opacity-60"
              >
                {forecastStatus === 'loading' ? 'Refreshing…' : 'Refresh'}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(selectedLocation)}
                aria-pressed={isFavorite}
                className={`rounded-full px-space-md py-space-2xs font-semibold transition ${
                  isFavorite
                    ? 'bg-white text-surface-base'
                    : 'border border-white/30 text-white hover:bg-white/10'
                }`}
              >
                {isFavorite ? 'Saved' : 'Save city'}
              </button>
            </div>
          </div>
        </article>
        <aside className="grid gap-space-sm">
          <VibeSummaryCard
            heading={vibeSummaryHeading}
            title={vibeSummaryContent.title}
            tagline={vibeSummaryContent.tagline}
            summary={vibeSummaryContent.summary}
            icon={vibeSummaryContent.icon}
            tags={vibeTags}
          />
          <InfoCard
            title="Location profile"
            body={`Pinned to ${selectedLocation.name}, ${selectedLocation.region}. ${locationSummary}`}
            actionLabel={status === 'locating' ? 'Locating...' : 'Detect location'}
            onAction={detectLocation}
            actionDisabled={status === 'locating'}
          />
          <InfoCard
            title="Live Open-Meteo snapshot"
            body={updatedLabel ? `${liveForecastCopy} Updated ${updatedLabel}.` : liveForecastCopy}
            actionLabel={forecastStatus === 'loading' ? 'Syncing...' : 'Refresh forecast'}
            actionDisabled={forecastStatus === 'loading'}
            onAction={refreshForecast}
          />
          {error ? (
            <p className="rounded-2xl border border-transparent bg-brand-sunrise px-space-md py-space-2xs text-sm font-semibold text-[var(--color-text-inverse)] shadow-sm">
              {error}
            </p>
          ) : null}
          {forecastError ? (
            <p className="rounded-2xl border border-transparent bg-brand-zenith px-space-md py-space-2xs text-sm font-semibold text-[var(--color-text-inverse)] shadow-sm">
              {forecastError}
            </p>
          ) : null}
        </aside>
      </section>
      <section className="grid gap-space-lg lg:grid-cols-[1.6fr_1fr]">
        <HourlyForecast
          points={hourlyPoints}
          isLoading={forecastStatus === 'loading' && !hourlyPoints.length}
        />
        <DailyForecast
          days={dailyPoints}
          isLoading={forecastStatus === 'loading' && !dailyPoints.length}
        />
      </section>
      <section className="grid gap-space-sm md:grid-cols-3">
        {planningTiles.map((tile) => (
          <article
            key={tile.title}
            className="rounded-3xl border border-surface-outline/60 bg-surface-raised px-space-md py-space-lg"
          >
            <div className="flex items-center gap-space-2xs">
              {tile.icon ? (
                <span className="text-2xl" aria-hidden>
                  {tile.icon}
                </span>
              ) : null}
              <h3 className="font-display text-xl text-text-primary">{tile.title}</h3>
            </div>
            <p className="mt-space-xs text-body-sm text-text-secondary">{tile.body}</p>
            <button type="button" className="mt-space-md text-sm font-semibold text-brand-sunrise">
              {tile.action}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

type PlaceholderPageProps = {
  title: string;
  copy: string;
};

function PlaceholderPage({ title, copy }: PlaceholderPageProps) {
  return (
    <div className="frosted-panel rounded-emphasis border border-dashed border-surface-outline/80 px-space-lg py-space-xl text-center">
      <h2 className="font-display text-display-md text-brand-zenith">{title}</h2>
      <p className="mx-auto mt-space-sm max-w-xl text-body-lg text-text-secondary">{copy}</p>
    </div>
  );
}

type InfoCardProps = {
  title: string;
  body: string;
  accent?: string;
  actionLabel?: string;
  actionDisabled?: boolean;
  onAction?: () => void;
};

type VibeSummaryCardProps = {
  heading: string;
  title: string;
  tagline: string;
  summary: string;
  icon: string | null;
  tags: string[];
};

function VibeSummaryCard({ heading, title, tagline, summary, icon, tags }: VibeSummaryCardProps) {
  return (
    <article className="rounded-3xl border border-surface-outline/60 bg-surface-raised p-space-lg text-text-primary shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-text-muted">{heading}</p>
      <div className="mt-space-2xs flex items-center gap-space-sm">
        {icon ? (
          <span className="text-4xl" aria-hidden>
            {icon}
          </span>
        ) : null}
        <div>
          <h3 className="font-display text-heading-lg text-brand-zenith">{title}</h3>
          <p className="text-body-sm text-text-secondary">{tagline}</p>
        </div>
      </div>
      <p className="mt-space-sm text-body-sm text-text-primary/90">{summary}</p>
      {tags.length ? (
        <div className="mt-space-sm flex flex-wrap gap-space-2xs">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-surface-outline/50 px-space-sm py-space-3xs text-[11px] font-semibold uppercase tracking-[0.35em] text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

type ForecastLoadingScreenProps = {
  gradient: string;
  locationName: string;
  region: string;
};

function ForecastLoadingScreen({ gradient, locationName, region }: ForecastLoadingScreenProps) {
  return (
    <article
      className="flex min-h-[60vh] flex-col items-center justify-center rounded-[32px] border border-white/5 p-space-xl text-center text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
      style={{ backgroundImage: gradient }}
      aria-live="polite"
      aria-label="Loading forecast"
      data-testid="forecast-loading-screen"
    >
      <Logo variant="wordmark" size={40} />
      <div className="mt-space-lg flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/30 border-t-white text-transparent animate-spin">
        <span className="sr-only">Loading…</span>
      </div>
      <div className="mt-space-lg space-y-space-2xs">
        <p className="text-sm uppercase tracking-[0.4em] text-white/80">Syncing forecast</p>
        <h2 className="font-display text-display-md">Dialing in your vibe</h2>
        <p className="text-body-sm text-white/75">
          Fetching live data for {locationName}, {region}.
        </p>
      </div>
      <div className="mt-space-lg w-full space-y-space-xs" aria-hidden>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={String(index)}
            className="h-4 animate-pulse rounded-full bg-white/10"
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
    </article>
  );
}

function InfoCard({ title, body, accent, actionLabel, onAction, actionDisabled }: InfoCardProps) {
  return (
    <article
      className={`rounded-3xl border border-surface-outline/60 p-space-lg text-text-primary ${accent ?? 'bg-surface-raised'}`}
    >
      <h3 className="font-display text-heading-lg">{title}</h3>
      <p className="mt-space-xs text-body-sm text-text-secondary">{body}</p>
      {actionLabel ? (
        <button
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
          className="mt-space-sm text-sm font-semibold text-brand-zenith underline-offset-4 hover:underline disabled:text-text-muted"
        >
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

function App() {
  return (
    <LocationProvider>
      <NetworkAwareShell>
        <div className="relative min-h-screen overflow-hidden bg-surface-base text-text-primary">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(51,102,204,0.55),_transparent_70%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(1,4,12,0.85)] via-transparent to-[rgba(1,4,12,0.65)]"
            aria-hidden
          />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-space-xl px-space-lg py-space-xl">
              <Routes>
                <Route path="/" element={<HomeShell />} />
                <Route path="/favorites" element={<FavoritesRoute />} />
                <Route path="/locations" element={<LocationsRoute />} />
                <Route
                  path="/insights"
                  element={
                    <PlaceholderPage
                      title="Vibe insights"
                      copy="Guidance, wardrobe nudges, and activity heatmaps will land here shortly."
                    />
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </NetworkAwareShell>
    </LocationProvider>
  );
}

export default App;

type Measurement = {
  value: number | null;
  unit: string | null;
};

type CurrentConditions = {
  temperature: Measurement;
  feelsLike: Measurement;
  humidity: Measurement;
  precipProbability: Measurement;
  windSpeed: Measurement;
  description: string | null;
};

type HourlyPoint = {
  timestamp: string;
  label: string;
  temperature: Measurement;
  feelsLike: Measurement;
  precipProbability: Measurement;
  windSpeed: Measurement;
  humidity: Measurement;
  isCurrentHour: boolean;
  weatherCode: number | null;
};

type DailyPoint = {
  date: string;
  label: string;
  high: Measurement;
  low: Measurement;
  precipProbability: Measurement;
  sunriseLabel: string | null;
  sunsetLabel: string | null;
  trendLabel: string | null;
};

function HourlyForecast({ points, isLoading }: { points: HourlyPoint[]; isLoading: boolean }) {
  return (
    <article className="frosted-panel rounded-emphasis border border-surface-outline/70 p-space-lg shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-text-muted">hourly outlook</p>
          <h2 className="font-display text-heading-lg text-brand-zenith">Next hours</h2>
        </div>
        <span className="text-xs text-text-muted">
          {points.length ? `Next ${points.length} hrs` : ''}
        </span>
      </div>
      {isLoading ? <ForecastSkeleton variant="strip" /> : null}
      {!isLoading && points.length > 0 ? (
        <div className="mt-space-md flex gap-space-sm overflow-x-auto pb-space-xs">
          {points.map((point) => (
            <div
              key={point.timestamp}
              className={`min-w-[140px] rounded-2xl border px-space-sm py-space-sm transition ${
                point.isCurrentHour
                  ? 'border-brand-zenith bg-brand-zenith/10 text-brand-zenith'
                  : 'border-surface-outline/60 bg-surface-raised text-text-primary'
              }`}
            >
              <p className="text-sm font-semibold">{point.label}</p>
              <div className="flex items-center gap-space-2xs">
                <p className="text-heading-lg font-semibold">
                  {formatMeasurement(point.temperature)}
                </p>
                <span className="text-xl" aria-hidden>
                  {getWeatherGlyph(point.weatherCode)}
                </span>
              </div>
              <p className="text-body-xs text-text-secondary">
                {point.feelsLike.value != null
                  ? `Feels ${formatMeasurement(point.feelsLike)}`
                  : 'Feels —'}
              </p>
              <p className="text-body-xs text-text-muted">
                {point.precipProbability.value != null
                  ? `${formatMeasurement(point.precipProbability)} rain`
                  : 'Rain —'}
              </p>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !points.length ? (
        <p className="mt-space-md text-body-sm text-text-muted">
          Hourly data will appear after the first successful sync.
        </p>
      ) : null}
    </article>
  );
}

function DailyForecast({ days, isLoading }: { days: DailyPoint[]; isLoading: boolean }) {
  return (
    <article className="rounded-3xl border border-surface-outline/70 bg-surface-raised p-space-lg shadow-card">
      <p className="text-sm uppercase tracking-[0.35em] text-text-muted">daily trend</p>
      <h2 className="font-display text-heading-lg text-brand-zenith">Upcoming days</h2>
      {isLoading ? <ForecastSkeleton variant="stack" /> : null}
      {!isLoading && days.length > 0 ? (
        <div className="mt-space-md space-y-space-sm">
          {days.map((day) => (
            <div
              key={day.date}
              className="flex items-center justify-between rounded-2xl border border-surface-outline/50 px-space-sm py-space-2xs"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{day.label}</p>
                <p className="text-body-xs text-text-secondary">
                  {day.sunriseLabel && day.sunsetLabel
                    ? `${day.sunriseLabel} / ${day.sunsetLabel}`
                    : 'Sun cycles pending'}
                </p>
                {day.trendLabel ? (
                  <p className="text-body-xs text-text-muted">{day.trendLabel}</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-body-sm text-text-primary">
                  {formatMeasurement(day.high)} /{' '}
                  <span className="text-text-muted">{formatMeasurement(day.low)}</span>
                </p>
                <p className="text-body-xs text-text-muted">
                  {day.precipProbability.value != null
                    ? `${formatMeasurement(day.precipProbability)} rain`
                    : 'Rain —'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {!isLoading && !days.length ? (
        <p className="mt-space-md text-body-sm text-text-muted">
          Daily summaries will show up once Open-Meteo returns data for this location.
        </p>
      ) : null}
    </article>
  );
}

function ForecastSkeleton({ variant }: { variant: 'strip' | 'stack' }) {
  if (variant === 'strip') {
    return (
      <div className="mt-space-md flex gap-space-sm overflow-hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={String(index)}
            className="h-[140px] min-w-[140px] rounded-2xl border border-surface-outline/40 bg-surface-base/40"
          >
            <div className="h-full w-full animate-pulse rounded-2xl bg-surface-raised/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-space-md space-y-space-xs">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={String(index)}
          className="h-[52px] rounded-2xl border border-surface-outline/40 bg-surface-raised/40"
        >
          <div className="h-full w-full animate-pulse rounded-2xl bg-surface-base/50" />
        </div>
      ))}
    </div>
  );
}

function createMeasurement(value: number | undefined | null, unit?: string | null): Measurement {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return { value: null, unit: unit ?? null };
  }
  return { value, unit: unit ?? null };
}

function formatMeasurement(measurement: Measurement, fallback = '—') {
  if (!measurement || measurement.value === null) {
    return fallback;
  }
  const trimmedUnit = measurement.unit?.trim();
  if (!trimmedUnit) {
    return `${Math.round(measurement.value)}`;
  }
  if (trimmedUnit.startsWith('°') || trimmedUnit.startsWith('%')) {
    return `${Math.round(measurement.value)}${trimmedUnit}`;
  }
  return `${Math.round(measurement.value)} ${trimmedUnit}`;
}

function measurementToFahrenheit(measurement: Measurement | null | undefined): number | null {
  if (!measurement || measurement.value === null) {
    return null;
  }
  const unit = measurement.unit?.toLowerCase();
  if (!unit) {
    return measurement.value;
  }
  if (unit.includes('°c') || unit.endsWith('c')) {
    return (measurement.value * 9) / 5 + 32;
  }
  if (unit.includes('°f') || unit.endsWith('f')) {
    return measurement.value;
  }
  return measurement.value;
}

function formatUpdatedTime(timestamp: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date(timestamp));
  } catch (_error) {
    return null;
  }
}

function formatHourLabel(timestamp: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      timeZone: timezone,
    }).format(new Date(timestamp));
  } catch (_error) {
    return '—';
  }
}

function formatWeekdayLabel(date: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      timeZone: timezone,
    }).format(new Date(date));
  } catch (_error) {
    return date;
  }
}

function formatOptionalTime(timestamp: string | undefined, timezone: string) {
  if (!timestamp) {
    return null;
  }
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    }).format(new Date(timestamp));
  } catch (_error) {
    return null;
  }
}

function deriveCurrentConditions(
  forecast: OpenMeteoForecastResponse | null,
  _timezone: string,
): CurrentConditions | null {
  if (!forecast || !forecast.current_weather) {
    return null;
  }

  const hourly = forecast.hourly as Record<string, number[] | string[] | undefined> | undefined;
  const times = (hourly?.time as string[]) ?? [];
  const index = times.indexOf(forecast.current_weather.time);

  const humiditySeries = (hourly?.relative_humidity_2m as number[]) ?? [];
  const feelsLikeSeries = (hourly?.apparent_temperature as number[]) ?? [];
  const precipSeries = (hourly?.precipitation_probability as number[]) ?? [];
  const hourlyUnits = (forecast.hourly_units ?? {}) as Record<string, string>;
  const currentUnits = forecast.current_weather_units ?? {};

  const temperatureUnit = currentUnits.temperature ?? hourlyUnits.temperature_2m ?? '°C';
  const apparentUnit = hourlyUnits.apparent_temperature ?? temperatureUnit;
  const humidityUnit = hourlyUnits.relative_humidity_2m ?? '%';
  const precipUnit = hourlyUnits.precipitation_probability ?? '%';
  const windUnit = currentUnits.windspeed ?? hourlyUnits.windspeed_10m ?? 'km/h';

  return {
    temperature: createMeasurement(forecast.current_weather.temperature, temperatureUnit),
    feelsLike: createMeasurement(index >= 0 ? feelsLikeSeries[index] : undefined, apparentUnit),
    humidity: createMeasurement(index >= 0 ? humiditySeries[index] : undefined, humidityUnit),
    precipProbability: createMeasurement(index >= 0 ? precipSeries[index] : undefined, precipUnit),
    windSpeed: createMeasurement(forecast.current_weather.windspeed, windUnit),
    description: describeWeatherCode(forecast.current_weather.weathercode),
  };
}

function buildHourlyPoints(
  forecast: OpenMeteoForecastResponse | null,
  timezone: string,
): HourlyPoint[] {
  if (!forecast?.hourly) {
    return [];
  }

  const hourly = forecast.hourly as Record<string, number[] | string[] | undefined>;
  const times = (hourly.time as string[]) ?? [];
  const temps = (hourly.temperature_2m as number[]) ?? [];
  const feels = (hourly.apparent_temperature as number[]) ?? [];
  const precip = (hourly.precipitation_probability as number[]) ?? [];
  const wind = (hourly.windspeed_10m as number[]) ?? [];
  const humidity = (hourly.relative_humidity_2m as number[]) ?? [];
  const codes = (hourly.weathercode as number[]) ?? [];
  const hourlyUnits = (forecast.hourly_units ?? {}) as Record<string, string>;
  const currentUnits = forecast.current_weather_units ?? {};

  const limit = Math.min(times.length, 12);
  const currentTimestamp = forecast.current_weather?.time ?? null;

  const points: HourlyPoint[] = [];
  for (let index = 0; index < limit; index += 1) {
    const timestamp = times[index];
    points.push({
      timestamp,
      label: formatHourLabel(timestamp, timezone),
      temperature: createMeasurement(
        temps[index],
        hourlyUnits.temperature_2m ?? currentUnits.temperature ?? '°C',
      ),
      feelsLike: createMeasurement(
        feels[index],
        hourlyUnits.apparent_temperature ??
          hourlyUnits.temperature_2m ??
          currentUnits.temperature ??
          '°C',
      ),
      precipProbability: createMeasurement(
        precip[index],
        hourlyUnits.precipitation_probability ?? '%',
      ),
      windSpeed: createMeasurement(
        wind[index],
        hourlyUnits.windspeed_10m ?? currentUnits.windspeed ?? 'km/h',
      ),
      humidity: createMeasurement(humidity[index], hourlyUnits.relative_humidity_2m ?? '%'),
      isCurrentHour: Boolean(currentTimestamp ? currentTimestamp === timestamp : index === 0),
      weatherCode: typeof codes[index] === 'number' ? (codes[index] ?? null) : null,
    });
  }

  return points;
}

function buildDailyPoints(
  forecast: OpenMeteoForecastResponse | null,
  timezone: string,
): DailyPoint[] {
  if (!forecast?.daily) {
    return [];
  }

  const daily = forecast.daily as Record<string, number[] | string[] | undefined>;
  const dates = (daily.time as string[]) ?? [];
  const highs = (daily.temperature_2m_max as number[]) ?? [];
  const lows = (daily.temperature_2m_min as number[]) ?? [];
  const precip = (daily.precipitation_probability_max as number[]) ?? [];
  const sunrise = (daily.sunrise as string[]) ?? [];
  const sunset = (daily.sunset as string[]) ?? [];
  const dailyUnits = (forecast.daily_units ?? {}) as Record<string, string>;
  const temperatureUnit =
    dailyUnits.temperature_2m_max ?? forecast.hourly_units?.temperature_2m ?? '°C';
  const precipUnit = dailyUnits.precipitation_probability_max ?? '%';
  const referenceHighMeasurement = createMeasurement(highs[0], temperatureUnit);
  const referenceHigh = measurementToFahrenheit(referenceHighMeasurement);

  return dates.map((date, index) => {
    const high = createMeasurement(highs[index], temperatureUnit);
    const low = createMeasurement(lows[index], temperatureUnit);
    const highF = measurementToFahrenheit(high);
    const trendLabel =
      referenceHigh != null && highF != null
        ? describeTemperatureDelta(highF - referenceHigh)
        : null;

    return {
      date,
      label: formatWeekdayLabel(date, timezone),
      high,
      low,
      precipProbability: createMeasurement(precip[index], precipUnit),
      sunriseLabel: formatOptionalTime(sunrise[index], timezone),
      sunsetLabel: formatOptionalTime(sunset[index], timezone),
      trendLabel,
    };
  });
}

function describeWeatherCode(code: number | undefined) {
  if (code === undefined || code === null) {
    return null;
  }

  if (code === 0) return 'Clear sky';
  if (code === 1) return 'Mainly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if ([51, 53, 55].includes(code)) return 'Drizzle';
  if ([56, 57].includes(code)) return 'Freezing drizzle';
  if ([61, 63, 65].includes(code)) return 'Rain showers';
  if ([66, 67].includes(code)) return 'Freezing rain';
  if ([71, 73, 75].includes(code)) return 'Snowfall';
  if (code === 77) return 'Snow grains';
  if ([80, 81, 82].includes(code)) return 'Rain showers';
  if ([85, 86].includes(code)) return 'Snow showers';
  if (code === 95) return 'Thunderstorm';
  if (code === 96 || code === 99) return 'Thunderstorm w/ hail';
  return 'Mixed conditions';
}

function describeTemperatureDelta(delta: number) {
  if (delta === 0) {
    return 'Same as today';
  }
  if (delta > 4) {
    return 'Much warmer than today';
  }
  if (delta > 1) {
    return 'Slightly warmer';
  }
  if (delta < -4) {
    return 'Much cooler than today';
  }
  if (delta < -1) {
    return 'Slightly cooler';
  }
  return delta > 0 ? 'Warmer than today' : 'Cooler than today';
}

function getWeatherGlyph(code: number | null) {
  if (code === null || code === undefined) {
    return '•';
  }
  if (code === 0) return '☀️';
  if ([1, 2].includes(code)) return '🌤️';
  if (code === 3) return '☁️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55].includes(code)) return '🌦️';
  if ([61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';
  return '•';
}

function getVibeTheme(vibe: string) {
  const normalized = vibe.toLowerCase();
  if (normalized.includes('coastal') || normalized.includes('glow')) {
    return { gradient: 'var(--gradient-vibe-coastal)', tagClass: 'bg-white/20 text-white' };
  }
  if (normalized.includes('urban') || normalized.includes('city')) {
    return { gradient: 'var(--gradient-vibe-urban)', tagClass: 'bg-black/20 text-white' };
  }
  if (normalized.includes('sun') || normalized.includes('heat')) {
    return { gradient: 'var(--gradient-vibe-heat)', tagClass: 'bg-black/25 text-white' };
  }
  if (normalized.includes('calm') || normalized.includes('zen')) {
    return { gradient: 'var(--gradient-vibe-calm)', tagClass: 'bg-black/10 text-white' };
  }
  return { gradient: 'var(--gradient-vibe-default)', tagClass: 'bg-black/20 text-white' };
}
