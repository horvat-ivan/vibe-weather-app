import { expect, test } from '@playwright/test';
import { mockForecastApi } from './utils/mockForecast.ts';

const PARIS_COORDINATES = {
  latitude: 48.8566,
  longitude: 2.3522,
};

const PARIS_GEOCODE_RESPONSE = {
  results: [
    {
      id: 42,
      name: 'Paris',
      latitude: PARIS_COORDINATES.latitude,
      longitude: PARIS_COORDINATES.longitude,
      timezone: 'Europe/Paris',
      country: 'France',
      country_code: 'FR',
      admin1: 'Île-de-France',
    },
  ],
};

test.describe('Device geolocation', () => {
  test.use({
    geolocation: PARIS_COORDINATES,
    permissions: ['geolocation'],
  });

  test.beforeEach(async ({ page }) => {
    await mockForecastApi(page);
    await page.route('**/geocoding-api.open-meteo.com/v1/reverse**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(PARIS_GEOCODE_RESPONSE),
      });
    });
    await page.goto('/');
  });

  test('reverse geocodes coordinates outside mock coverage', async ({ page }) => {
    const detectButton = page.getByRole('button', { name: /Use current location/i });
    await detectButton.click();

    await expect(page.getByText(/Paris, Île-de-France/i).first()).toBeVisible();
    await expect(page.getByText(/Pinned to Paris/i)).toBeVisible();
  });
});
