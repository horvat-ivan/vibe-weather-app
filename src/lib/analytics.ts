export type ForecastFetchContext = {
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type ForecastFetchSuccessEvent = {
  type: 'forecast_fetch_success';
  context: ForecastFetchContext;
  responseTimestamp: string;
};

export type ForecastFetchFailureEvent = {
  type: 'forecast_fetch_failure';
  context: ForecastFetchContext;
  errorMessage: string;
};

export type GeolocationSuccessEvent = {
  type: 'geolocation_success';
  method: 'mock-match' | 'reverse-geocode';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  resolvedLocationId: string;
  distanceKm?: number | null;
};

export type GeolocationFailureEvent = {
  type: 'geolocation_failure';
  reason:
    | 'permission_denied'
    | 'timeout'
    | 'position_unavailable'
    | 'unsupported'
    | 'reverse_geocode_failed'
    | 'unknown';
  message: string;
};

export type ShareMethod = 'web-share' | 'clipboard' | 'unsupported';

export type ShareAttemptEvent = {
  type: 'share_attempt';
  method: ShareMethod;
  locationId: string;
  vibe: string;
};

export type ShareSuccessEvent = {
  type: 'share_success';
  method: ShareMethod;
  locationId: string;
  vibe: string;
};

export type ShareFailureEvent = {
  type: 'share_failure';
  method: ShareMethod;
  locationId: string;
  vibe: string;
  message: string;
};

export type FavoriteToggledEvent = {
  type: 'favorite_toggled';
  locationId: string;
  action: 'added' | 'removed';
  totalFavorites: number;
};

export type AnalyticsEvent =
  | ForecastFetchSuccessEvent
  | ForecastFetchFailureEvent
  | GeolocationSuccessEvent
  | GeolocationFailureEvent
  | ShareAttemptEvent
  | ShareSuccessEvent
  | ShareFailureEvent
  | FavoriteToggledEvent;
export type AnalyticsListener = (event: AnalyticsEvent) => void;

const defaultListener: AnalyticsListener = (event) => {
  if (typeof console !== 'undefined' && console.info) {
    console.info('[analytics]', event.type, event);
  }
};

let listener: AnalyticsListener = defaultListener;

export function setAnalyticsListener(nextListener: AnalyticsListener | null) {
  listener = nextListener ?? defaultListener;
}

function emit(event: AnalyticsEvent) {
  try {
    listener(event);
  } catch {
    // Prevent analytics failures from impacting the app surface.
  }
}

export function logForecastFetchSuccess(context: ForecastFetchContext) {
  emit({
    type: 'forecast_fetch_success',
    context,
    responseTimestamp: new Date().toISOString(),
  });
}

export function logForecastFetchFailure(context: ForecastFetchContext, errorMessage: string) {
  emit({
    type: 'forecast_fetch_failure',
    context,
    errorMessage,
  });
}

export function logGeolocationSuccess(event: Omit<GeolocationSuccessEvent, 'type'>) {
  emit({
    type: 'geolocation_success',
    ...event,
  });
}

export function logGeolocationFailure(event: Omit<GeolocationFailureEvent, 'type'>) {
  emit({
    type: 'geolocation_failure',
    ...event,
  });
}

export function logShareAttempt(event: Omit<ShareAttemptEvent, 'type'>) {
  emit({
    type: 'share_attempt',
    ...event,
  });
}

export function logShareSuccess(event: Omit<ShareSuccessEvent, 'type'>) {
  emit({
    type: 'share_success',
    ...event,
  });
}

export function logShareFailure(event: Omit<ShareFailureEvent, 'type'>) {
  emit({
    type: 'share_failure',
    ...event,
  });
}

export function logFavoriteToggled(event: Omit<FavoriteToggledEvent, 'type'>) {
  emit({
    type: 'favorite_toggled',
    ...event,
  });
}
