import type { LocationSnapshot } from './types.ts';

export const SELECTED_LOCATION_STORAGE_KEY = 'vibe-weather.selected-location';
export const FAVORITE_LOCATIONS_STORAGE_KEY = 'vibe-weather.favorite-locations';

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }

  if ('localStorage' in globalThis) {
    const storage = (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage;
    if (storage) {
      return storage;
    }
  }

  return null;
}

export function loadStoredLocationSnapshot(): LocationSnapshot | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(SELECTED_LOCATION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }
    return JSON.parse(rawValue) as LocationSnapshot;
  } catch {
    return null;
  }
}

export function persistSelectedLocationSnapshot(location: LocationSnapshot): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(SELECTED_LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // Best-effort persistence. Ignore storage quota and privacy errors.
  }
}

export function loadStoredFavoriteLocations(): LocationSnapshot[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(FAVORITE_LOCATIONS_STORAGE_KEY);
    if (!rawValue) {
      return [];
    }
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as LocationSnapshot[];
  } catch {
    return [];
  }
}

export function persistFavoriteLocations(locations: LocationSnapshot[]): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(FAVORITE_LOCATIONS_STORAGE_KEY, JSON.stringify(locations));
  } catch {
    // Ignore persistence failures (quota/private mode).
  }
}
