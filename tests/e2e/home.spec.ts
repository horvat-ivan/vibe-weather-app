import { expect, test } from '@playwright/test';
import { mockForecastApi } from './utils/mockForecast.ts';

test.describe('Home shell', () => {
  test.beforeEach(async ({ page }) => {
    await mockForecastApi(page);
  });

  test('shows the current vibe hero, navigation, and CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('hero-vibe-label')).toContainText(/coastal glow/i);
    await expect(page.getByTestId('hero-temperature')).toHaveText(/°/);
    await expect(page.getByTestId('hero-feels-like')).toContainText(/Feels like/i);
    await expect(page.getByRole('button', { name: /share vibe/i })).toBeVisible();

    const nav = page.getByRole('navigation');
    await expect(nav).toContainText('Forecast');
    await expect(nav).toContainText('Locations');
  });

  test('navigates to the locations route via nav link', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('header-location-switcher').click();
    await expect(page).toHaveURL(/\/locations$/);
    await expect(page.getByRole('heading', { name: /saved locations/i })).toBeVisible();
  });
});
