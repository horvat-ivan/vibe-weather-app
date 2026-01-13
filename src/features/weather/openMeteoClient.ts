import { logForecastFetchFailure, logForecastFetchSuccess } from '../../lib/analytics.ts';

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type ForecastRequestOptions<
  THourly extends string = string,
  TDaily extends string = string,
> = {
  latitude: number;
  longitude: number;
  timezone?: string;
  hourly?: readonly THourly[];
  daily?: readonly TDaily[];
  forecastDays?: number;
  pastDays?: number;
  currentWeather?: boolean;
  signal?: AbortSignal;
};

export type OpenMeteoForecastResponse<
  THourly extends string = string,
  TDaily extends string = string,
> = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_weather_units?: Record<string, string>;
  current_weather?: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
    time: string;
  };
  hourly_units?: Record<'time' | THourly, string>;
  hourly?: Record<'time' | THourly, number[] | string[]>;
  daily_units?: Record<'time' | TDaily, string>;
  daily?: Record<'time' | TDaily, number[] | string[]>;
};

export type OpenMeteoErrorPayload = {
  error: true;
  reason: string;
};

export class OpenMeteoClientError extends Error {
  status?: number;

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = 'OpenMeteoClientError';
    this.status = options?.status;
    if (options?.cause) {
      // Assign cause in a backwards compatible way for environments without Error.cause
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

function isErrorPayload(payload: unknown): payload is OpenMeteoErrorPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    Boolean((payload as { error?: unknown }).error)
  );
}

function buildForecastUrl(options: ForecastRequestOptions): string {
  const url = new URL(OPEN_METEO_FORECAST_URL);
  url.searchParams.set('latitude', String(options.latitude));
  url.searchParams.set('longitude', String(options.longitude));
  url.searchParams.set('timezone', options.timezone ?? 'auto');

  if (options.hourly?.length) {
    url.searchParams.set('hourly', options.hourly.join(','));
  }

  if (options.daily?.length) {
    url.searchParams.set('daily', options.daily.join(','));
  }

  if (typeof options.forecastDays === 'number') {
    url.searchParams.set('forecast_days', String(options.forecastDays));
  }

  if (typeof options.pastDays === 'number') {
    url.searchParams.set('past_days', String(options.pastDays));
  }

  if (typeof options.currentWeather === 'boolean') {
    url.searchParams.set('current_weather', options.currentWeather ? 'true' : 'false');
  }

  return url.toString();
}

type Fetcher = typeof fetch;

export async function fetchOpenMeteoForecast<
  THourly extends string = string,
  TDaily extends string = string,
>(
  options: ForecastRequestOptions<THourly, TDaily>,
  fetcher: Fetcher | undefined = globalThis.fetch,
): Promise<OpenMeteoForecastResponse<THourly, TDaily>> {
  const context = {
    latitude: options.latitude,
    longitude: options.longitude,
    timezone: options.timezone,
  };

  const failWith = (
    message: string,
    errorOptions?: { status?: number; cause?: unknown },
  ): never => {
    logForecastFetchFailure(context, message);
    throw new OpenMeteoClientError(message, errorOptions);
  };

  if (!fetcher) {
    failWith('Fetch API is not available in this environment.');
  }

  const requestUrl = buildForecastUrl(options);

  const response = await fetcher(requestUrl, { signal: options.signal }).catch((error) =>
    failWith('Unable to reach Open-Meteo. Check your network connection.', { cause: error }),
  );

  if (!response.ok) {
    failWith(
      `Open-Meteo request failed with status ${response.status} ${response.statusText}`.trim(),
      {
        status: response.status,
      },
    );
  }

  const payload = (await response.json().catch((error) => {
    failWith('Unable to parse Open-Meteo response.', { cause: error });
  })) as OpenMeteoForecastResponse<THourly, TDaily> | OpenMeteoErrorPayload | undefined | null;

  if (!payload) {
    failWith('Open-Meteo returned an empty response.');
  }

  if (isErrorPayload(payload)) {
    failWith(payload.reason ?? 'Open-Meteo returned an error response.');
  }

  logForecastFetchSuccess(context);
  return payload as OpenMeteoForecastResponse<THourly, TDaily>;
}

export const openMeteoClient = {
  fetchForecast: fetchOpenMeteoForecast,
};
