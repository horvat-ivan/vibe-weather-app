import { describe, expect, it, vi } from 'vitest';
import {
  OpenMeteoGeocodingError,
  type ReverseGeocodingResult,
  reverseGeocodeLocation,
} from './openMeteoGeocodingClient.ts';

describe('reverseGeocodeLocation', () => {
  const sampleResult: ReverseGeocodingResult = {
    id: 123,
    name: 'Zagreb',
    latitude: 45.815,
    longitude: 15.9819,
    country: 'Croatia',
    country_code: 'HR',
    timezone: 'Europe/Zagreb',
    admin1: 'City of Zagreb',
  };

  it('returns the top geocoding result', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ results: [sampleResult] }),
    });

    const result = await reverseGeocodeLocation({ latitude: 45.8, longitude: 15.98 }, fetchMock);
    expect(result).toEqual(sampleResult);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('latitude=45.8'),
      expect.anything(),
    );
  });

  it('returns null when no results are available', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ results: [] }),
    });

    const result = await reverseGeocodeLocation({ latitude: 0, longitude: 0 }, fetchMock);
    expect(result).toBeNull();
  });

  it('throws when fetch fails and no fallback exists', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    await expect(
      reverseGeocodeLocation({ latitude: -80, longitude: 0 }, fetchMock),
    ).rejects.toBeInstanceOf(OpenMeteoGeocodingError);
  });

  it('throws when response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: async () => ({}),
    });

    await expect(
      reverseGeocodeLocation({ latitude: -80, longitude: 0 }, fetchMock),
    ).rejects.toThrow(/status 500/);
  });

  it('falls back to local data when fetch fails near a known city', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline'));
    const result = await reverseGeocodeLocation({ latitude: 45.81, longitude: 15.98 }, fetchMock);
    expect(result?.name).toBe('Zagreb');
  });

  it('falls back to local data when API returns no results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ results: [] }),
    });

    const result = await reverseGeocodeLocation({ latitude: 48.85, longitude: 2.34 }, fetchMock);
    expect(result?.name).toBe('Paris');
  });
});
