export type QuickMetric = {
  label: string;
  value: string;
  detail: string;
};

export type PlanningTile = {
  title: string;
  body: string;
  action: string;
  icon?: string;
};

export type LocationSnapshot = {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  summary: string;
  vibe: string;
  heroTemperature: number;
  heroFeelsLike: number;
  condition: string;
  tags: string[];
  metrics: QuickMetric[];
  planning: PlanningTile[];
};

export type LocationStateStatus = 'idle' | 'locating' | 'error';

export type LocationState = {
  selectedLocation: LocationSnapshot;
  recentLocations: LocationSnapshot[];
  status: LocationStateStatus;
  error: string | null;
};

export type GeolocationCoordinatesLike = {
  latitude: number;
  longitude: number;
};

export type Geolocator = () => Promise<GeolocationCoordinatesLike>;
