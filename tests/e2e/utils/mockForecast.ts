import type { Page } from '@playwright/test';

const MOCK_TIMEPOINTS = ['2024-03-01T11:00:00Z', '2024-03-01T12:00:00Z', '2024-03-01T13:00:00Z'];

const mockForecastResponse = {
  latitude: 37.7749,
  longitude: -122.4194,
  generationtime_ms: 0.12,
  utc_offset_seconds: 0,
  timezone: 'America/Los_Angeles',
  timezone_abbreviation: 'PST',
  elevation: 16,
  current_weather_units: {
    temperature: '°F',
    windspeed: 'mph',
  },
  current_weather: {
    temperature: 72,
    windspeed: 7,
    winddirection: 120,
    weathercode: 1,
    is_day: 1,
    time: MOCK_TIMEPOINTS[1],
  },
  hourly_units: {
    time: 'iso8601',
    temperature_2m: '°F',
    apparent_temperature: '°F',
    relative_humidity_2m: '%',
    precipitation_probability: '%',
    windspeed_10m: 'mph',
    weathercode: 'code',
  },
  hourly: {
    time: MOCK_TIMEPOINTS,
    temperature_2m: [70, 72, 71],
    apparent_temperature: [69, 70, 71],
    relative_humidity_2m: [58, 60, 62],
    precipitation_probability: [5, 10, 20],
    windspeed_10m: [5, 7, 8],
    weathercode: [1, 1, 2],
  },
  daily_units: {
    time: 'iso8601',
    temperature_2m_max: '°F',
    temperature_2m_min: '°F',
    precipitation_probability_max: '%',
    sunrise: 'iso8601',
    sunset: 'iso8601',
  },
  daily: {
    time: ['2024-03-01'],
    temperature_2m_max: [75],
    temperature_2m_min: [60],
    precipitation_probability_max: [15],
    sunrise: ['2024-03-01T06:35:00Z'],
    sunset: ['2024-03-01T18:12:00Z'],
  },
};

export async function mockForecastApi(page: Page) {
  await page.route('**/v1/forecast**', async (route) => {
    await route.fulfill({
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(mockForecastResponse),
    });
  });
}
