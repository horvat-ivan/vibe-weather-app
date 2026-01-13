import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LocationSnapshot } from '../location/types.ts';
import { fetchOpenMeteoForecast, type OpenMeteoForecastResponse } from './openMeteoClient.ts';
import { useForecastForLocation } from './useForecast.ts';

vi.mock('./openMeteoClient.ts', () => ({
  fetchOpenMeteoForecast: vi.fn(),
}));

const mockLocation: LocationSnapshot = {
  id: 'sf',
  name: 'San Francisco',
  region: 'California',
  country: 'USA',
  latitude: 37.7749,
  longitude: -122.4194,
  timezone: 'America/Los_Angeles',
  summary: 'Bay breezes with filtered sunshine.',
  vibe: 'Coastal glow',
  heroTemperature: 68,
  heroFeelsLike: 66,
  condition: 'Partly cloudy',
  tags: ['Layer-friendly', 'Breezy'],
  metrics: [],
  planning: [],
};

const mockForecastResponse: OpenMeteoForecastResponse = {
  latitude: mockLocation.latitude,
  longitude: mockLocation.longitude,
  generationtime_ms: 0.2,
  utc_offset_seconds: 0,
  timezone: mockLocation.timezone,
  timezone_abbreviation: 'PDT',
  elevation: 10,
  current_weather: {
    temperature: 18,
    windspeed: 12,
    winddirection: 160,
    weathercode: 2,
    is_day: 1,
    time: '2024-03-01T12:00',
  },
};

const mockedFetch = vi.mocked(fetchOpenMeteoForecast);

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  } as unknown as Storage);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useForecastForLocation', () => {
  it('loads forecast data for a location and allows manual refresh', async () => {
    mockedFetch.mockResolvedValueOnce(mockForecastResponse);
    mockedFetch.mockResolvedValueOnce(mockForecastResponse);

    const { result } = renderHook(() => useForecastForLocation(mockLocation));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.data).toEqual(mockForecastResponse);
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('surfaces errors emitted by the client', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useForecastForLocation(mockLocation));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
      expect(result.current.error).toContain('network down');
    });
  });

  it('falls back to cached snapshot when available', async () => {
    const cached = {
      locationId: mockLocation.id,
      forecast: mockForecastResponse,
      updatedAt: '2024-03-01T12:00:00.000Z',
    };
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(cached));
    mockedFetch.mockRejectedValueOnce(new Error('offline'));

    const { result } = renderHook(() => useForecastForLocation(mockLocation));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockForecastResponse);
      expect(result.current.hasEverResolved).toBe(true);
    });
  });
});
