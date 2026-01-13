import { expect, test } from '@playwright/test';
import { mockForecastApi } from './utils/mockForecast.ts';

test.describe('Locations management', () => {
  test.beforeEach(async ({ page }) => {
    await mockForecastApi(page);
    await page.goto('/locations');
  });

  test('searching shows results and selecting updates the pinned card', async ({ page }) => {
    const searchInput = page.getByTestId('location-search-input');
    await searchInput.fill('Austin');

    const searchResults = page.getByTestId('location-search-result');
    await expect(searchResults.first()).toContainText('Austin');

    await searchResults.first().click();
    await expect(searchInput).toHaveValue('');

    await expect(page.getByTestId('pinned-location-name')).toHaveText(/Austin/i);
  });

  test('recent chips can be used to jump between saved locations', async ({ page }) => {
    const chips = page.getByTestId('recent-location-chip');
    await expect(chips.first()).toHaveText(/San Francisco/i);

    await page.getByTestId('location-search-input').fill('Brooklyn');
    await page.getByTestId('location-search-result').first().click();
    await expect(page.getByTestId('pinned-location-name')).toHaveText(/Brooklyn/i);

    const sanFranciscoChip = chips.filter({ hasText: 'San Francisco' });
    await sanFranciscoChip.click();
    await expect(page.getByTestId('pinned-location-name')).toHaveText(/San Francisco/i);
  });
});
