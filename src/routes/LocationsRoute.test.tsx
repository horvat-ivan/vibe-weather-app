import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { useLocationService } from '../features/location/locationContext.tsx';
import { defaultLocation } from '../features/location/mockLocations.ts';
import type { LocationSnapshot } from '../features/location/types.ts';
import { LocationsRoute } from './LocationsRoute';

vi.mock('../features/location/locationContext.tsx', () => ({
  useLocationService: vi.fn(),
}));

const mockedUseLocationService = vi.mocked(useLocationService);

const baseLocationState = {
  selectedLocation: defaultLocation,
  recentLocations: [defaultLocation],
  favoriteLocations: [defaultLocation],
  status: 'idle' as const,
  error: null,
};

const noopSearch = () => [] as LocationSnapshot[];
const noopSelect = (_location: LocationSnapshot) => {};
const noopToggle = (_location: LocationSnapshot) => {};

function setupServiceMock(overrides: {
  status?: 'idle' | 'locating' | 'error';
  error?: string | null;
  detectLocation?: () => Promise<void>;
}) {
  const detectLocation = overrides.detectLocation ?? vi.fn(() => Promise.resolve());
  mockedUseLocationService.mockReturnValue({
    state: {
      ...baseLocationState,
      status: overrides.status ?? baseLocationState.status,
      error: overrides.error ?? baseLocationState.error,
    },
    search: noopSearch,
    selectLocation: noopSelect,
    detectLocation,
    toggleFavorite: noopToggle,
  });
  return { detectLocation };
}

describe('LocationsRoute', () => {
  beforeEach(() => {
    mockedUseLocationService.mockReset();
  });

  it('surfaced detection failures via the connectivity banner and retries when tapped', () => {
    const detectLocation = vi.fn(() => Promise.resolve());
    setupServiceMock({ status: 'error', error: 'Geolocation blocked', detectLocation });

    render(<LocationsRoute />);

    const banner = screen.getByTestId('location-error-banner');
    expect(banner).toHaveTextContent(/geolocation blocked/i);

    screen.getByRole('button', { name: /try again/i }).click();
    expect(detectLocation).toHaveBeenCalledTimes(1);
  });

  it('disables the retry action while a location request is in flight', () => {
    setupServiceMock({ status: 'locating', error: 'Determining your city' });

    render(<LocationsRoute />);

    const retryButton = screen.getByRole('button', { name: /detecting/i });
    expect(retryButton).toBeDisabled();
  });
});
