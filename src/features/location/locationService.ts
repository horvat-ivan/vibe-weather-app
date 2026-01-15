import { defaultLocation, mockLocations } from './mockLocations.ts';
import type { GeolocationCoordinatesLike, Geolocator, LocationSnapshot } from './types.ts';

export const MAX_RECENT_LOCATIONS = 5;
const EARTH_RADIUS_KM = 6371;

export function searchMockLocations(query: string): LocationSnapshot[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return mockLocations.filter((location) => {
    const haystack = `${location.name} ${location.region} ${location.country}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function computeDistanceKm(a: GeolocationCoordinatesLike, b: GeolocationCoordinatesLike): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const haversine = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return EARTH_RADIUS_KM * centralAngle;
}

export function findClosestMockLocation(coords: GeolocationCoordinatesLike): {
  location: LocationSnapshot;
  distanceKm: number;
} {
  return mockLocations.reduce<{ location: LocationSnapshot; distanceKm: number }>(
    (closest, location) => {
      const distanceKm = computeDistanceKm(coords, location);
      if (distanceKm < closest.distanceKm) {
        return { location, distanceKm };
      }
      return closest;
    },
    { location: defaultLocation, distanceKm: Number.POSITIVE_INFINITY },
  );
}

export function matchMockLocationByCoords(coords: GeolocationCoordinatesLike): LocationSnapshot {
  return findClosestMockLocation(coords).location;
}

export function findMockLocationById(id: string): LocationSnapshot | null {
  return mockLocations.find((location) => location.id === id) ?? null;
}

function buildNavigatorGeolocator(): Geolocator | null {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return null;
  }

  return () =>
    new Promise<GeolocationCoordinatesLike>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        (error) => {
          const enhancedError = new Error(error.message);
          (enhancedError as Error & { code?: number }).code = error.code;
          reject(enhancedError);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
}

export const navigatorGeolocator = buildNavigatorGeolocator();
