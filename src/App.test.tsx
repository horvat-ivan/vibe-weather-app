import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import App from './App';
import {
  fetchOpenMeteoForecast,
  type OpenMeteoForecastResponse,
} from './features/weather/openMeteoClient.ts';
import * as analytics from './lib/analytics.ts';

vi.mock('./features/weather/openMeteoClient.ts', () => ({
  fetchOpenMeteoForecast: vi.fn(),
}));

const mockForecastResponse: OpenMeteoForecastResponse = {
  latitude: 37.7749,
  longitude: -122.4194,
  generationtime_ms: 0.2,
  utc_offset_seconds: 0,
  timezone: 'America/Los_Angeles',
  timezone_abbreviation: 'PDT',
  elevation: 15,
  current_weather: {
    temperature: 18,
    windspeed: 10,
    winddirection: 120,
    weathercode: 1,
    is_day: 1,
    time: '2024-03-01T12:00',
  },
};

const mockedFetch = vi.mocked(fetchOpenMeteoForecast);
const shareAttemptSpy = vi.spyOn(analytics, 'logShareAttempt');
const shareSuccessSpy = vi.spyOn(analytics, 'logShareSuccess');
const shareFailureSpy = vi.spyOn(analytics, 'logShareFailure');

beforeEach(() => {
  mockedFetch.mockReset();
  mockedFetch.mockResolvedValue(mockForecastResponse);
});

afterEach(() => {
  vi.clearAllMocks();
  Reflect.deleteProperty(navigator as Record<string, unknown>, 'share');
  Reflect.deleteProperty(navigator as Record<string, unknown>, 'clipboard');
  shareAttemptSpy.mockClear();
  shareSuccessSpy.mockClear();
  shareFailureSpy.mockClear();
});

function createDeferred<T>() {
  let resolve: ((value: T) => void) | undefined;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  if (!resolve) {
    throw new Error('Deferred promise failed to initialize.');
  }
  return { promise, resolve };
}

describe('App shell', () => {
  it('renders the hero headline and quick metrics sourced from the location service', async () => {
    const deferred = createDeferred<OpenMeteoForecastResponse>();
    mockedFetch.mockReturnValueOnce(deferred.promise);

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('forecast-loading-screen')).toBeInTheDocument();

    await act(async () => {
      deferred.resolve(mockForecastResponse);
    });

    await screen.findByRole('heading', { name: /Next hours/i });
    expect(screen.getAllByText(/humidity/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/share vibe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use current location/i })).toBeInTheDocument();
    expect(await screen.findByText(/Pinned to San Francisco/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Next hours/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Upcoming days/i })).toBeInTheDocument();
    expect(screen.getByText(/Wardrobe sync/i)).toBeInTheDocument();
    expect(screen.getByText(/today's vibe/i)).toBeInTheDocument();
  });

  it('renders the locations route with search and device actions', async () => {
    render(
      <MemoryRouter initialEntries={['/locations']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /saved locations/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/search city or neighborhood/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use current location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /san francisco/i })).toBeInTheDocument();
  });

  it('keeps the insights route placeholder while the feature is pending', async () => {
    render(
      <MemoryRouter initialEntries={['/insights']}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /vibe insights/i })).toBeInTheDocument();
    expect(screen.getByText(/Guidance, wardrobe nudges/i)).toBeInTheDocument();
  });

  it('keeps the existing forecast visible while refreshing', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /Next hours/i })).toBeInTheDocument();

    const deferred = createDeferred<OpenMeteoForecastResponse>();
    mockedFetch.mockReturnValueOnce(deferred.promise);

    const refreshButton = screen.getByRole('button', { name: /^refresh$/i });
    await act(async () => {
      refreshButton.click();
    });

    expect(screen.queryByTestId('forecast-loading-screen')).not.toBeInTheDocument();

    await act(async () => {
      deferred.resolve(mockForecastResponse);
    });
  });

  it('shows a retry banner when the forecast request fails and lets the user retry', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('Network timeout'));

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const retryBanner = await screen.findByTestId('forecast-retry-banner');
    expect(retryBanner).toHaveTextContent(/network timeout/i);

    mockedFetch.mockResolvedValueOnce(mockForecastResponse);

    await act(async () => {
      screen.getByRole('button', { name: /retry sync/i }).click();
    });

    await waitFor(() =>
      expect(screen.queryByTestId('forecast-retry-banner')).not.toBeInTheDocument(),
    );
  });

  it('uses the Web Share API when available', async () => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const shareButton = await screen.findByRole('button', { name: /share vibe/i });

    await act(async () => {
      shareButton.click();
    });

    expect(navigator.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('Vibe Weather'),
        text: expect.stringContaining('San Francisco'),
      }),
    );
    expect(shareAttemptSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'web-share' }));
    expect(shareSuccessSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'web-share' }));
    expect(shareFailureSpy).not.toHaveBeenCalled();
  });

  it('falls back to copying the link when navigator.share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const shareButton = await screen.findByRole('button', { name: /share vibe/i });

    await act(async () => {
      shareButton.click();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('share-feedback')).toHaveTextContent(/copied/i);
    expect(shareAttemptSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'clipboard' }));
    expect(shareSuccessSpy).toHaveBeenCalledWith(expect.objectContaining({ method: 'clipboard' }));
    expect(shareFailureSpy).not.toHaveBeenCalled();
  });

  it('logs a failure when sharing is unsupported', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    const shareButton = await screen.findByRole('button', { name: /share vibe/i });

    await act(async () => {
      shareButton.click();
    });

    expect(shareAttemptSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'unsupported' }),
    );
    expect(shareFailureSpy).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'unsupported' }),
    );
  });
});
