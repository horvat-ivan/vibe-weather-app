import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  logFavoriteToggled,
  logGeolocationFailure,
  logGeolocationSuccess,
} from '../../lib/analytics.ts';
import {
  LocationProvider,
  UNSUPPORTED_LOCATION_ERROR,
  useLocationService,
} from './locationContext.tsx';
import { SELECTED_LOCATION_STORAGE_KEY } from './locationStorage.ts';
import { mockLocations } from './mockLocations.ts';
import { reverseGeocodeLocation } from './openMeteoGeocodingClient.ts';
import type { Geolocator } from './types.ts';

vi.mock('./openMeteoGeocodingClient.ts', () => ({
  reverseGeocodeLocation: vi.fn(),
}));
vi.mock('../../lib/analytics.ts', () => ({
  logGeolocationFailure: vi.fn(),
  logGeolocationSuccess: vi.fn(),
  logFavoriteToggled: vi.fn(),
}));

const mockedReverseGeocodeLocation = vi.mocked(reverseGeocodeLocation);
const mockedLogGeolocationSuccess = vi.mocked(logGeolocationSuccess);
const mockedLogGeolocationFailure = vi.mocked(logGeolocationFailure);
const mockedLogFavoriteToggled = vi.mocked(logFavoriteToggled);

function renderLocationHook(geolocator: Geolocator | null = null) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LocationProvider geolocator={geolocator}>{children}</LocationProvider>
  );

  return renderHook(() => useLocationService(), { wrapper });
}

function createDeferred<T>() {
  let resolve: ((value: T) => void) | undefined;
  let reject: ((reason?: unknown) => void) | undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  if (!resolve || !reject) {
    throw new Error('Deferred promise failed to initialize.');
  }
  return { promise, resolve, reject };
}

describe('LocationProvider persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('hydrates state from a persisted selection', () => {
    const storedLocation = mockLocations[1];
    window.localStorage.setItem(SELECTED_LOCATION_STORAGE_KEY, JSON.stringify(storedLocation));

    const { result } = renderLocationHook();

    expect(result.current.state.selectedLocation.id).toBe(storedLocation.id);
    expect(result.current.state.recentLocations[0]?.id).toBe(storedLocation.id);
  });

  it('persists manual selections', () => {
    const nextLocation = mockLocations[2];
    const { result } = renderLocationHook();

    act(() => {
      result.current.selectLocation(nextLocation);
    });

    const storedValue = window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}').id).toBe(nextLocation.id);
  });

  it('persists detected locations', async () => {
    const targetLocation = mockLocations[0];
    const mockGeolocator: Geolocator = vi.fn().mockResolvedValue({
      latitude: targetLocation.latitude,
      longitude: targetLocation.longitude,
    });

    const { result } = renderLocationHook(mockGeolocator);

    await act(async () => {
      await result.current.detectLocation();
    });

    const storedValue = window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}').id).toBe(targetLocation.id);
    expect(mockedLogGeolocationSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'mock-match',
        resolvedLocationId: targetLocation.id,
      }),
    );
  });

  it('ignores late geolocation results after a manual selection', async () => {
    const deferred = createDeferred<{ latitude: number; longitude: number }>();
    const mockGeolocator: Geolocator = vi.fn().mockImplementation(() => deferred.promise);
    const { result } = renderLocationHook(mockGeolocator);

    let detectPromise: Promise<void> | null = null;
    await act(async () => {
      detectPromise = result.current.detectLocation();
    });

    const manualLocation = mockLocations[1];
    act(() => {
      result.current.selectLocation(manualLocation);
    });

    deferred.resolve({
      latitude: mockLocations[2].latitude,
      longitude: mockLocations[2].longitude,
    });

    if (!detectPromise) {
      throw new Error('detectLocation did not return a promise.');
    }

    await act(async () => {
      await detectPromise;
    });

    expect(result.current.state.selectedLocation.id).toBe(manualLocation.id);
    const storedValue = window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}').id).toBe(manualLocation.id);
  });

  it('surfaces an error when no mock location is nearby', async () => {
    const mockGeolocator: Geolocator = vi.fn().mockResolvedValue({ latitude: 0, longitude: 0 });
    mockedReverseGeocodeLocation.mockResolvedValue(null);
    const { result } = renderLocationHook(mockGeolocator);

    await act(async () => {
      await result.current.detectLocation();
    });

    expect(result.current.state.selectedLocation.id).toBe(mockLocations[0].id);
    expect(result.current.state.error).toBe(UNSUPPORTED_LOCATION_ERROR);
    expect(window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY)).toBeNull();
    expect(mockedLogGeolocationFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'reverse_geocode_failed' }),
    );
  });

  it('pins a geocoded location when outside mock coverage', async () => {
    const mockGeolocator: Geolocator = vi
      .fn()
      .mockResolvedValue({ latitude: 48.85, longitude: 2.35 });
    mockedReverseGeocodeLocation.mockResolvedValue({
      id: 42,
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      country: 'France',
      country_code: 'FR',
      timezone: 'Europe/Paris',
      admin1: 'Île-de-France',
    });

    const { result } = renderLocationHook(mockGeolocator);

    await act(async () => {
      await result.current.detectLocation();
    });

    expect(result.current.state.selectedLocation.name).toBe('Paris');
    expect(result.current.state.selectedLocation.id).toBe('geo-42');
    const storedValue = window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? '{}').name).toBe('Paris');
    expect(mockedLogGeolocationSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'reverse-geocode', resolvedLocationId: 'geo-42' }),
    );
  });

  it('logs failures when geolocation is unavailable', async () => {
    const { result } = renderLocationHook(null);

    await act(async () => {
      await result.current.detectLocation();
    });

    expect(mockedLogGeolocationFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'unsupported' }),
    );
  });

  it('logs permission-denied errors from the browser', async () => {
    const mockError = Object.assign(new Error('User denied Geolocation'), { code: 1 });
    const mockGeolocator: Geolocator = vi.fn().mockRejectedValue(mockError);
    const { result } = renderLocationHook(mockGeolocator);

    await act(async () => {
      await result.current.detectLocation();
    });

    expect(mockedLogGeolocationFailure).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'permission_denied' }),
    );
  });

  it('logs favorite toggles with counts', () => {
    const { result } = renderLocationHook();
    const targetLocation = mockLocations[1];

    act(() => {
      result.current.toggleFavorite(targetLocation);
    });

    expect(mockedLogFavoriteToggled).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'added',
        locationId: targetLocation.id,
        totalFavorites: 1,
      }),
    );

    act(() => {
      result.current.toggleFavorite(targetLocation);
    });

    expect(mockedLogFavoriteToggled).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'removed',
        locationId: targetLocation.id,
        totalFavorites: 0,
      }),
    );
  });
});
