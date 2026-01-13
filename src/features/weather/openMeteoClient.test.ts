import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logForecastFetchFailure, logForecastFetchSuccess } from '../../lib/analytics.ts';
import {
  fetchOpenMeteoForecast,
  OpenMeteoClientError,
  type OpenMeteoForecastResponse,
} from './openMeteoClient.ts';

vi.mock('../../lib/analytics.ts', () => ({
  logForecastFetchSuccess: vi.fn(),
  logForecastFetchFailure: vi.fn(),
}));

const mockedLogForecastFetchSuccess = vi.mocked(logForecastFetchSuccess);
const mockedLogForecastFetchFailure = vi.mocked(logForecastFetchFailure);

describe('fetchOpenMeteoForecast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the correct query string and returns the typed payload', async () => {
    const hourly = ['temperature_2m', 'relative_humidity_2m'] as const;
    const daily = ['sunrise', 'sunset'] as const;
    const mockPayload: OpenMeteoForecastResponse<(typeof hourly)[number], (typeof daily)[number]> =
      {
        latitude: 37.7749,
        longitude: -122.4194,
        generationtime_ms: 0.123,
        utc_offset_seconds: 0,
        timezone: 'GMT',
        timezone_abbreviation: 'GMT',
        elevation: 30,
        current_weather: {
          temperature: 15,
          windspeed: 5,
          winddirection: 200,
          weathercode: 3,
          is_day: 1,
          time: '2024-03-01T12:00:00Z',
        },
        hourly_units: { time: 'iso8601', temperature_2m: '°C', relative_humidity_2m: '%' },
        hourly: {
          time: ['2024-03-01T12:00:00Z'],
          temperature_2m: [15],
          relative_humidity_2m: [54],
        },
        daily_units: { time: 'iso8601', sunrise: 'iso8601', sunset: 'iso8601' },
        daily: {
          time: ['2024-03-01'],
          sunrise: ['2024-03-01T06:15'],
          sunset: ['2024-03-01T18:32'],
        },
      };

    const signal = new AbortController().signal;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => mockPayload,
    });

    const result = await fetchOpenMeteoForecast(
      {
        latitude: 37.7749,
        longitude: -122.4194,
        timezone: 'America/Los_Angeles',
        hourly,
        daily,
        forecastDays: 3,
        currentWeather: true,
        signal,
      },
      fetchMock,
    );

    expect(result).toEqual(mockPayload);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [requestUrl, init] = fetchMock.mock.calls[0];
    expect(requestUrl).toContain('latitude=37.7749');
    expect(requestUrl).toContain('longitude=-122.4194');
    expect(requestUrl).toContain('timezone=America%2FLos_Angeles');
    expect(requestUrl).toContain('hourly=temperature_2m%2Crelative_humidity_2m');
    expect(requestUrl).toContain('daily=sunrise%2Csunset');
    expect(requestUrl).toContain('forecast_days=3');
    expect(requestUrl).toContain('current_weather=true');
    expect(init).toEqual({ signal });
    expect(mockedLogForecastFetchSuccess).toHaveBeenCalledWith({
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
    });
    expect(mockedLogForecastFetchFailure).not.toHaveBeenCalled();
  });

  it('throws when fetch rejects', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));

    await expect(
      fetchOpenMeteoForecast({ latitude: 0, longitude: 0 }, fetchMock),
    ).rejects.toThrowError(OpenMeteoClientError);
    expect(mockedLogForecastFetchFailure).toHaveBeenCalledWith(
      { latitude: 0, longitude: 0, timezone: undefined },
      'Unable to reach Open-Meteo. Check your network connection.',
    );
  });

  it('throws when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'boom' }),
    });

    await expect(
      fetchOpenMeteoForecast({ latitude: 0, longitude: 0 }, fetchMock),
    ).rejects.toThrowError(/status 500/);
    expect(mockedLogForecastFetchFailure).toHaveBeenCalledWith(
      { latitude: 0, longitude: 0, timezone: undefined },
      'Open-Meteo request failed with status 500 Internal Server Error',
    );
  });

  it('throws when Open-Meteo returns an error payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ error: true, reason: 'Invalid coordinates' }),
    });

    await expect(
      fetchOpenMeteoForecast({ latitude: 999, longitude: 999 }, fetchMock),
    ).rejects.toThrowError(/Invalid coordinates/);
    expect(mockedLogForecastFetchFailure).toHaveBeenCalledWith(
      { latitude: 999, longitude: 999, timezone: undefined },
      'Invalid coordinates',
    );
  });

  it('defaults timezone to auto when omitted', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        latitude: 0,
        longitude: 0,
        generationtime_ms: 0,
        utc_offset_seconds: 0,
        timezone: 'auto',
        timezone_abbreviation: 'UTC',
        elevation: 0,
      }),
    });

    await fetchOpenMeteoForecast({ latitude: 55.7, longitude: 12.5 }, fetchMock);
    expect(fetchMock.mock.calls[0][0]).toContain('timezone=auto');
  });
});
