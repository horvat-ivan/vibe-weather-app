import { VIBE_TAXONOMY, type VibeDescriptor, type VibeId } from './vibeTaxonomy.ts';

export type VibeInput = {
  temperatureF: number | null | undefined;
  feelsLikeF: number | null | undefined;
  humidity: number | null | undefined;
  precipProbability: number | null | undefined;
  windMph: number | null | undefined;
  weatherCode: number | null | undefined;
};

export type GuidanceBlock = {
  title: string;
  body: string;
  action: string;
  icon: string;
};

export type VibeProfile = {
  id: VibeId;
  name: string;
  tagline: string;
  summary: string;
  icon: string;
  tags: string[];
  wardrobe: GuidanceBlock;
  activities: GuidanceBlock;
  alerts: GuidanceBlock;
};

type NormalizedVibeInput = {
  temperatureF: number | null;
  feelsLikeF: number | null;
  humidity: number | null;
  precipProbability: number | null;
  windMph: number | null;
  weatherCode: number | null;
};

type VibeRule = {
  id: VibeId;
  predicate: (input: NormalizedVibeInput) => boolean;
};

const STORM_CODES = new Set([
  45, 48, 51, 53, 55, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99,
]);
const DEFAULT_ACTIONS = {
  wardrobe: 'Open wardrobe tips',
  activities: 'Plan activities',
  alerts: 'Review alerts',
} as const;
const GUIDANCE_ICONS = {
  wardrobe: '🧥',
  activities: '🗺️',
  alerts: '⚠️',
} as const;

const VIBE_RULES: VibeRule[] = [
  {
    id: 'storm-mode',
    predicate: (input) => isStormSignal(input),
  },
  {
    id: 'heatwave',
    predicate: (input) => coalesce(input.feelsLikeF, input.temperatureF) >= 92,
  },
  {
    id: 'humid-haze',
    predicate: (input) =>
      (input.temperatureF ?? -Infinity) >= 78 && (input.humidity ?? -Infinity) >= 70,
  },
  {
    id: 'wind-shift',
    predicate: (input) => (input.windMph ?? 0) >= 20,
  },
  {
    id: 'coastal-glow',
    predicate: (input) =>
      inRange(input.temperatureF, 60, 75) &&
      isAtMost(input.humidity, 70) &&
      isAtMost(input.precipProbability, 25),
  },
  {
    id: 'crisp-active',
    predicate: (input) =>
      inRange(input.temperatureF, 50, 65) &&
      isAtMost(input.humidity, 55) &&
      isAtMost(input.precipProbability, 30),
  },
  {
    id: 'layered-chill',
    predicate: (input) => (input.temperatureF ?? Infinity) < 50,
  },
  {
    id: 'default-balance',
    predicate: () => true,
  },
];

export function deriveVibeProfile(input: VibeInput): VibeProfile {
  const normalized = normalizeInput(input);
  const matchedRule =
    VIBE_RULES.find((rule) => rule.predicate(normalized)) ?? VIBE_RULES[VIBE_RULES.length - 1];
  const descriptor = VIBE_TAXONOMY[matchedRule.id];
  return buildProfile(descriptor, normalized);
}

function buildProfile(descriptor: VibeDescriptor, input: NormalizedVibeInput): VibeProfile {
  const summary = [descriptor.summary, describeCurrentSnapshot(input)].filter(Boolean).join(' ');
  const tags = buildTags(descriptor.baseTags, input);

  return {
    id: descriptor.id,
    name: descriptor.name,
    tagline: descriptor.tagline,
    summary,
    icon: descriptor.icon,
    tags,
    wardrobe: {
      title: 'Wardrobe sync',
      body: descriptor.wardrobe,
      action: DEFAULT_ACTIONS.wardrobe,
      icon: GUIDANCE_ICONS.wardrobe,
    },
    activities: {
      title: 'Activity cues',
      body: descriptor.activities,
      action: DEFAULT_ACTIONS.activities,
      icon: GUIDANCE_ICONS.activities,
    },
    alerts: {
      title: 'Alert window',
      body: descriptor.alerts,
      action: DEFAULT_ACTIONS.alerts,
      icon: GUIDANCE_ICONS.alerts,
    },
  };
}

function describeCurrentSnapshot(input: NormalizedVibeInput) {
  const parts = [] as string[];
  if (input.feelsLikeF != null) {
    parts.push(`Feels like ${Math.round(input.feelsLikeF)}°`);
  }
  if (input.windMph != null) {
    parts.push(`${Math.round(input.windMph)} mph wind`);
  }
  if (input.precipProbability != null) {
    parts.push(`${input.precipProbability}% rain risk`);
  }
  return parts.length ? `${parts.join(' · ')}.` : '';
}

function buildTags(baseTags: string[], input: NormalizedVibeInput) {
  const ordered: string[] = [];
  if (input.feelsLikeF != null) {
    ordered.push(`${Math.round(input.feelsLikeF)}° feel`);
  } else if (input.temperatureF != null) {
    ordered.push(`${Math.round(input.temperatureF)}° temp`);
  }
  if (input.humidity != null) {
    ordered.push(`Humidity ${input.humidity}%`);
  }
  if (input.precipProbability != null) {
    ordered.push(`${input.precipProbability}% rain`);
  }
  ordered.push(...baseTags);

  const deduped: string[] = [];
  for (const tag of ordered) {
    if (tag && !deduped.includes(tag)) {
      deduped.push(tag);
    }
  }

  if (deduped.length <= 3) {
    return deduped;
  }

  const sliced = deduped.slice(0, 3);
  const hasBaseTag = baseTags.some((tag) => sliced.includes(tag));
  if (!hasBaseTag && baseTags.length > 0) {
    sliced[sliced.length - 1] = baseTags[0];
  }
  return sliced;
}

function normalizeInput(input: VibeInput): NormalizedVibeInput {
  const temperature = sanitizeNumber(input.temperatureF);
  const feelsLike = sanitizeNumber(input.feelsLikeF) ?? temperature;
  return {
    temperatureF: temperature,
    feelsLikeF: feelsLike,
    humidity: sanitizeNumber(input.humidity),
    precipProbability: sanitizeNumber(input.precipProbability),
    windMph: sanitizeNumber(input.windMph),
    weatherCode: sanitizeNumber(input.weatherCode),
  };
}

function sanitizeNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }
  return Number(value);
}

function inRange(value: number | null, min: number, max: number) {
  if (value === null) {
    return false;
  }
  return value >= min && value <= max;
}

function isAtMost(value: number | null, limit: number) {
  if (value === null) {
    return true;
  }
  return value <= limit;
}

function coalesce(...values: Array<number | null>) {
  for (const value of values) {
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  return -Infinity;
}

function isStormSignal(input: NormalizedVibeInput) {
  if (input.precipProbability !== null && input.precipProbability >= 70) {
    return true;
  }
  if (input.weatherCode !== null && STORM_CODES.has(input.weatherCode)) {
    return true;
  }
  return false;
}
