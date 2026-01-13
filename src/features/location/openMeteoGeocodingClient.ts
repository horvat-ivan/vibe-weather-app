import { REVERSE_GEOCODING_FALLBACKS } from './geocodingFallbacks.ts';

const OPEN_METEO_REVERSE_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';
const FALLBACK_DISTANCE_KM = 250;

export type ReverseGeocodingRequestOptions = {
  latitude: number;
  longitude: number;
  count?: number;
  language?: string;
  signal?: AbortSignal;
};

export type ReverseGeocodingResult = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  admin2?: string;
};

export type ReverseGeocodingResponse = {
  results?: ReverseGeocodingResult[];
};

export class OpenMeteoGeocodingError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'OpenMeteoGeocodingError';
    if (options?.cause) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

type Fetcher = typeof fetch;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function computeDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const haversine = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * centralAngle;
}

function findFallbackGeocode(latitude: number, longitude: number): ReverseGeocodingResult | null {
  const basePoint = { latitude, longitude };
  const closest = REVERSE_GEOCODING_FALLBACKS.reduce<{
    result: ReverseGeocodingResult | null;
    distance: number;
  }>(
    (current, candidate) => {
      const distance = computeDistanceKm(basePoint, candidate);
      if (distance < current.distance) {
        return { result: candidate, distance };
      }
      return current;
    },
    { result: null, distance: Number.POSITIVE_INFINITY },
  );

  if (closest.distance <= FALLBACK_DISTANCE_KM && closest.result) {
    return closest.result;
  }

  return null;
}

export async function reverseGeocodeLocation(
  options: ReverseGeocodingRequestOptions,
  fetcher: Fetcher | undefined = globalThis.fetch,
): Promise<ReverseGeocodingResult | null> {
  const fallbackResult = findFallbackGeocode(options.latitude, options.longitude);
  if (!fetcher) {
    return fallbackResult;
  }

  const url = new URL(OPEN_METEO_REVERSE_GEOCODING_URL);
  url.searchParams.set('latitude', String(options.latitude));
  url.searchParams.set('longitude', String(options.longitude));
  url.searchParams.set('count', String(options.count ?? 1));
  url.searchParams.set('language', options.language ?? 'en');

  let response: Response;
  try {
    response = await fetcher(url.toString(), { signal: options.signal });
  } catch (error) {
    if (fallbackResult) {
      return fallbackResult;
    }
    throw new OpenMeteoGeocodingError('Unable to reach Open-Meteo geocoding service.', {
      cause: error,
    });
  }

  if (!response.ok) {
    if (fallbackResult) {
      return fallbackResult;
    }
    throw new OpenMeteoGeocodingError(
      `Reverse geocoding failed with status ${response.status} ${response.statusText}`.trim(),
    );
  }

  const payload = (await response.json()) as ReverseGeocodingResponse | null;
  if (!payload?.results?.length) {
    return fallbackResult;
  }

  return payload.results[0] ?? null;
}
