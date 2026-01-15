import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type GeolocationFailureEvent,
  logFavoriteToggled,
  logGeolocationFailure,
  logGeolocationSuccess,
} from '../../lib/analytics.ts';
import {
  findClosestMockLocation,
  MAX_RECENT_LOCATIONS,
  navigatorGeolocator,
  searchMockLocations,
} from './locationService.ts';
import {
  loadStoredFavoriteLocations,
  loadStoredLocationSnapshot,
  persistFavoriteLocations,
  persistSelectedLocationSnapshot,
} from './locationStorage.ts';
import { defaultLocation } from './mockLocations.ts';
import { type ReverseGeocodingResult, reverseGeocodeLocation } from './openMeteoGeocodingClient.ts';
import type { Geolocator, LocationSnapshot, LocationState } from './types.ts';

export const UNSUPPORTED_LOCATION_ERROR = "We're still adding support for your area.";
const MAX_GEOLOCATION_DISTANCE_KM = 400;
const MAX_FAVORITES = 8;
const FALLBACK_LIVE_METRICS = [
  { label: 'Humidity', value: '—', detail: 'Syncing live data' },
  { label: 'Wind', value: '—', detail: 'Syncing live data' },
  { label: 'Precip', value: '—', detail: 'Syncing live data' },
];
const FALLBACK_LIVE_PLANNING = [
  {
    title: 'Live vibe sync',
    body: 'Fetching wardrobe and activity cues once the forecast loads.',
    action: 'Refresh forecast',
    icon: '🔄',
  },
  {
    title: 'Pinned automatically',
    body: 'Device location resolved to this city using Open-Meteo geocoding.',
    action: 'Detect again',
    icon: '📍',
  },
  {
    title: 'Mock data incoming',
    body: 'Mock planning cards update in a later milestone.',
    action: 'View roadmap',
    icon: '🗺️',
  },
];

const defaultState: LocationState = {
  selectedLocation: defaultLocation,
  recentLocations: [defaultLocation],
  favoriteLocations: [],
  status: 'idle',
  error: null,
};

function buildInitialState(): LocationState {
  const favorites = loadStoredFavoriteLocations();
  const baseState: LocationState = {
    ...defaultState,
    favoriteLocations: favorites.length ? favorites.slice(0, MAX_FAVORITES) : [],
  };
  const storedLocation = loadStoredLocationSnapshot();
  if (!storedLocation) {
    return baseState;
  }

  return applySelection(baseState, storedLocation);
}

type GeolocationFailureReason = GeolocationFailureEvent['reason'];

function mapGeolocationErrorToReason(error: unknown): GeolocationFailureReason {
  if (error && typeof error === 'object' && 'code' in error) {
    const code =
      typeof (error as { code?: number }).code === 'number'
        ? (error as { code?: number }).code
        : null;
    if (code === 1) {
      return 'permission_denied';
    }
    if (code === 2) {
      return 'position_unavailable';
    }
    if (code === 3) {
      return 'timeout';
    }
  }

  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return 'permission_denied';
  }

  if (error instanceof Error) {
    const normalized = error.message.trim().toLowerCase();
    if (normalized.includes('permission')) {
      return 'permission_denied';
    }
    if (normalized.includes('timeout')) {
      return 'timeout';
    }
    if (normalized.includes('unavailable')) {
      return 'position_unavailable';
    }
  }

  return 'unknown';
}

function applySelection(state: LocationState, next: LocationSnapshot): LocationState {
  const filtered = state.recentLocations.filter((location) => location.id !== next.id);
  const recentLocations = [next, ...filtered].slice(0, MAX_RECENT_LOCATIONS);

  return {
    ...state,
    selectedLocation: next,
    recentLocations,
  };
}

function buildGeocodedSnapshot(geocode: ReverseGeocodingResult): LocationSnapshot {
  const region = geocode.admin1 ?? geocode.admin2 ?? 'Local area';
  const country = geocode.country ?? geocode.country_code ?? 'Unknown country';
  const timezone = geocode.timezone ?? defaultLocation.timezone;
  const id = geocode.id
    ? `geo-${geocode.id}`
    : `geo-${geocode.latitude.toFixed(4)}-${geocode.longitude.toFixed(4)}`;

  return {
    ...defaultLocation,
    id,
    name: geocode.name,
    region,
    country,
    latitude: geocode.latitude,
    longitude: geocode.longitude,
    timezone,
    summary: `Live Open-Meteo sync for ${geocode.name}.`,
    vibe: 'Live sync',
    heroTemperature: defaultLocation.heroTemperature,
    heroFeelsLike: defaultLocation.heroFeelsLike,
    condition: 'Live conditions updating shortly',
    tags: [`${region}`, `${country}`].filter(Boolean),
    metrics: FALLBACK_LIVE_METRICS,
    planning: FALLBACK_LIVE_PLANNING,
  };
}

type LocationServiceValue = {
  state: LocationState;
  search: (query: string) => LocationSnapshot[];
  selectLocation: (location: LocationSnapshot) => void;
  detectLocation: () => Promise<void>;
  toggleFavorite: (location: LocationSnapshot) => void;
};

const LocationServiceContext = createContext<LocationServiceValue | null>(null);

export function LocationProvider({
  children,
  geolocator = navigatorGeolocator,
}: {
  children: ReactNode;
  geolocator?: Geolocator | null;
}) {
  const [state, setState] = useState<LocationState>(buildInitialState);
  const activeDetectRequest = useRef<symbol | null>(null);

  const search = useCallback((query: string) => searchMockLocations(query).slice(0, 5), []);

  const selectLocation = useCallback((location: LocationSnapshot) => {
    activeDetectRequest.current = null;
    persistSelectedLocationSnapshot(location);
    setState((prev) => ({ ...applySelection(prev, location), status: 'idle', error: null }));
  }, []);

  const toggleFavorite = useCallback((location: LocationSnapshot) => {
    setState((prev) => {
      const exists = prev.favoriteLocations.some((fav) => fav.id === location.id);
      const filtered = prev.favoriteLocations.filter((fav) => fav.id !== location.id);
      const favoriteLocations = exists ? filtered : [location, ...filtered].slice(0, MAX_FAVORITES);
      persistFavoriteLocations(favoriteLocations);
      logFavoriteToggled({
        locationId: location.id,
        action: exists ? 'removed' : 'added',
        totalFavorites: favoriteLocations.length,
      });
      return { ...prev, favoriteLocations };
    });
  }, []);

  const detectLocation = useCallback(async () => {
    if (!geolocator) {
      const message = 'Geolocation unavailable on this device.';
      logGeolocationFailure({ reason: 'unsupported', message });
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: message,
      }));
      return;
    }

    const requestToken = Symbol('detect-location');
    activeDetectRequest.current = requestToken;
    setState((prev) => ({ ...prev, status: 'locating', error: null }));
    let pendingReverseGeocode = false;
    try {
      const coords = await geolocator();
      if (activeDetectRequest.current !== requestToken) {
        return;
      }
      const { location: matchedLocation, distanceKm } = findClosestMockLocation(coords);
      if (distanceKm > MAX_GEOLOCATION_DISTANCE_KM) {
        pendingReverseGeocode = true;
        const geocoded = await reverseGeocodeLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        pendingReverseGeocode = false;
        if (!geocoded) {
          logGeolocationFailure({
            reason: 'reverse_geocode_failed',
            message: UNSUPPORTED_LOCATION_ERROR,
          });
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: UNSUPPORTED_LOCATION_ERROR,
          }));
          return;
        }

        const snapshot = buildGeocodedSnapshot(geocoded);
        persistSelectedLocationSnapshot(snapshot);
        logGeolocationSuccess({
          method: 'reverse-geocode',
          coordinates: coords,
          resolvedLocationId: snapshot.id,
          distanceKm,
        });
        setState((prev) => ({
          ...applySelection(prev, snapshot),
          status: 'idle',
          error: null,
        }));
        return;
      }
      persistSelectedLocationSnapshot(matchedLocation);
      logGeolocationSuccess({
        method: 'mock-match',
        coordinates: coords,
        resolvedLocationId: matchedLocation.id,
        distanceKm,
      });
      setState((prev) => ({
        ...applySelection(prev, matchedLocation),
        status: 'idle',
        error: null,
      }));
    } catch (error) {
      if (activeDetectRequest.current !== requestToken) {
        return;
      }
      const message = error instanceof Error ? error.message : 'Unable to determine location.';
      logGeolocationFailure({
        reason: pendingReverseGeocode
          ? 'reverse_geocode_failed'
          : mapGeolocationErrorToReason(error),
        message,
      });
      setState((prev) => ({ ...prev, status: 'error', error: message }));
    } finally {
      if (activeDetectRequest.current === requestToken) {
        activeDetectRequest.current = null;
      }
    }
  }, [geolocator]);

  const value = useMemo<LocationServiceValue>(
    () => ({
      state,
      search,
      selectLocation,
      detectLocation,
      toggleFavorite,
    }),
    [state, search, selectLocation, detectLocation, toggleFavorite],
  );

  return (
    <LocationServiceContext.Provider value={value}>{children}</LocationServiceContext.Provider>
  );
}

export function useLocationService() {
  const context = useContext(LocationServiceContext);
  if (!context) {
    throw new Error('useLocationService must be used within a LocationProvider');
  }

  return context;
}
