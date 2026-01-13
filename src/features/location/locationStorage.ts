import type { LocationSnapshot } from './types.ts';

export const SELECTED_LOCATION_STORAGE_KEY = 'vibe-weather.selected-location';

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
