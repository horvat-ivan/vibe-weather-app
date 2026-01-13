import { describe, expect, it } from 'vitest';
import { deriveVibeProfile } from './vibeEngine.ts';

describe('vibe engine', () => {
  it('prioritizes storm mode when rain probability spikes', () => {
    const profile = deriveVibeProfile({
      temperatureF: 72,
      feelsLikeF: 74,
      humidity: 68,
      precipProbability: 80,
      windMph: 10,
      weatherCode: 61,
    });

    expect(profile.id).toBe('storm-mode');
    expect(profile.summary).toMatch(/80% rain/);
    expect(profile.tags).toContain('Heavy rain');
    expect(profile.icon).toBe('⛈️');
  });

  it('returns heatwave when feels like temps soar', () => {
    const profile = deriveVibeProfile({
      temperatureF: 90,
      feelsLikeF: 98,
      humidity: 45,
      precipProbability: 10,
      windMph: 8,
      weatherCode: 1,
    });

    expect(profile.id).toBe('heatwave');
    expect(profile.tags[0]).toBe('98° feel');
    expect(profile.wardrobe.icon).toBe('🧥');
  });

  it('detects humid haze when warm temps pair with high humidity', () => {
    const profile = deriveVibeProfile({
      temperatureF: 82,
      feelsLikeF: 85,
      humidity: 78,
      precipProbability: 20,
      windMph: 5,
      weatherCode: 2,
    });

    expect(profile.id).toBe('humid-haze');
    expect(profile.summary).toMatch(/Feels like 85°/);
  });

  it('surfaces wind shift on gusty days even if temps are mild', () => {
    const profile = deriveVibeProfile({
      temperatureF: 66,
      feelsLikeF: 65,
      humidity: 40,
      precipProbability: 10,
      windMph: 25,
      weatherCode: 2,
    });

    expect(profile.id).toBe('wind-shift');
  });

  it('labels mild low-precip days as coastal glow', () => {
    const profile = deriveVibeProfile({
      temperatureF: 68,
      feelsLikeF: 70,
      humidity: 55,
      precipProbability: 10,
      windMph: 8,
      weatherCode: 1,
    });

    expect(profile.id).toBe('coastal-glow');
    expect(profile.tags.length).toBeGreaterThan(0);
  });

  it('falls back to balanced blend when no rule matches', () => {
    const profile = deriveVibeProfile({
      temperatureF: 70,
      feelsLikeF: 70,
      humidity: 60,
      precipProbability: 40,
      windMph: 8,
      weatherCode: 1,
    });

    expect(profile.id).toBe('default-balance');
  });
});
