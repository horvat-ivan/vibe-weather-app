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
  findClosestMockLocation,
  MAX_RECENT_LOCATIONS,
  navigatorGeolocator,
  searchMockLocations,
} from './locationService.ts';
import { loadStoredLocationSnapshot, persistSelectedLocationSnapshot } from './locationStorage.ts';
import { defaultLocation } from './mockLocations.ts';
import { type ReverseGeocodingResult, reverseGeocodeLocation } from './openMeteoGeocodingClient.ts';
import type { Geolocator, LocationSnapshot, LocationState } from './types.ts';

export const UNSUPPORTED_LOCATION_ERROR = "We're still adding support for your area.";
const MAX_GEOLOCATION_DISTANCE_KM = 400;
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
  status: 'idle',
  error: null,
};

function buildInitialState(): LocationState {
  const storedLocation = loadStoredLocationSnapshot();
  if (!storedLocation) {
    return defaultState;
  }

  return applySelection(defaultState, storedLocation);
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

  const detectLocation = useCallback(async () => {
    if (!geolocator) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Geolocation unavailable on this device.',
      }));
      return;
    }

    const requestToken = Symbol('detect-location');
    activeDetectRequest.current = requestToken;
    setState((prev) => ({ ...prev, status: 'locating', error: null }));
    try {
      const coords = await geolocator();
      if (activeDetectRequest.current !== requestToken) {
        return;
      }
      const { location: matchedLocation, distanceKm } = findClosestMockLocation(coords);
      if (distanceKm > MAX_GEOLOCATION_DISTANCE_KM) {
        const geocoded = await reverseGeocodeLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        if (!geocoded) {
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: UNSUPPORTED_LOCATION_ERROR,
          }));
          return;
        }

        const snapshot = buildGeocodedSnapshot(geocoded);
        persistSelectedLocationSnapshot(snapshot);
        setState((prev) => ({
          ...applySelection(prev, snapshot),
          status: 'idle',
          error: null,
        }));
        return;
      }
      persistSelectedLocationSnapshot(matchedLocation);
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
    }),
    [state, search, selectLocation, detectLocation],
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
