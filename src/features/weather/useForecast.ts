import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LocationSnapshot } from '../location/types.ts';
import { fetchOpenMeteoForecast, type OpenMeteoForecastResponse } from './openMeteoClient.ts';

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'precipitation_probability',
  'windspeed_10m',
  'weathercode',
] as const;
const DAILY_FIELDS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
] as const;
const FORECAST_DAYS = 5;

type HourlyField = (typeof HOURLY_FIELDS)[number];
type DailyField = (typeof DAILY_FIELDS)[number];
type ForecastResponse = OpenMeteoForecastResponse<HourlyField, DailyField>;

type ForecastStatus = 'idle' | 'loading' | 'success' | 'error';

type ForecastHookState = {
  status: ForecastStatus;
  data: ForecastResponse | null;
  error: string | null;
  updatedAt: string | null;
  locationId: string | null;
  hasEverResolved: boolean;
  cachedSnapshot: CachedSnapshot | null;
};

const INITIAL_STATE: ForecastHookState = {
  status: 'idle',
  data: null,
  error: null,
  updatedAt: null,
  locationId: null,
  hasEverResolved: false,
  cachedSnapshot: loadCachedSnapshot(),
};

const CACHE_KEY = 'vibe-weather:last-forecast';

type CachedSnapshot = {
  locationId: string;
  forecast: ForecastResponse;
  updatedAt: string;
};

function loadCachedSnapshot(): CachedSnapshot | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as CachedSnapshot;
  } catch (_error) {
    return null;
  }
}

function persistSnapshot(snapshot: CachedSnapshot) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch (_error) {
    // noop: caching is best-effort
  }
}

export function useForecastForLocation(location: LocationSnapshot) {
  const [state, setState] = useState<ForecastHookState>(INITIAL_STATE);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const refreshIteration = refreshIndex;
    const controller = new AbortController();

    setState((prev) => {
      const locationChanged = prev.locationId !== location.id;
      const shouldHydrateFromCache =
        locationChanged || (!prev.hasEverResolved && refreshIteration === 0);
      const cached = loadCachedSnapshot();
      const cachedMatch = cached && cached.locationId === location.id;
      return {
        ...prev,
        status: 'loading',
        error: null,
        cachedSnapshot: cachedMatch ? cached : null,
        ...(shouldHydrateFromCache
          ? {
              data: cachedMatch ? (cached?.forecast ?? null) : null,
              updatedAt: cachedMatch ? (cached?.updatedAt ?? null) : null,
              hasEverResolved: Boolean(cachedMatch && cached?.forecast),
            }
          : {}),
      };
    });

    const loadForecast = async () => {
      try {
        const forecast = await fetchOpenMeteoForecast<HourlyField, DailyField>({
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          hourly: HOURLY_FIELDS,
          daily: DAILY_FIELDS,
          currentWeather: true,
          forecastDays: FORECAST_DAYS,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        const updatedAt = new Date().toISOString();
        const snapshot: CachedSnapshot = {
          locationId: location.id,
          forecast,
          updatedAt,
        };
        persistSnapshot(snapshot);
        setState({
          status: 'success',
          data: forecast,
          error: null,
          updatedAt,
          locationId: location.id,
          hasEverResolved: true,
          cachedSnapshot: snapshot,
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load forecast.';
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: message,
          hasEverResolved: prev.hasEverResolved,
        }));
      }
    };

    loadForecast();

    return () => {
      controller.abort();
    };
  }, [location.id, location.latitude, location.longitude, location.timezone, refreshIndex]);

  return useMemo(
    () => ({
      status: state.status,
      data: state.data,
      error: state.error,
      updatedAt: state.updatedAt,
      hasEverResolved: state.hasEverResolved,
      cachedSnapshot: state.cachedSnapshot,
      refresh,
    }),
    [
      state.status,
      state.data,
      state.error,
      state.updatedAt,
      state.hasEverResolved,
      state.cachedSnapshot,
      refresh,
    ],
  );
}
