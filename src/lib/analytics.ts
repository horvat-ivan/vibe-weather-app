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

export type AnalyticsEvent = ForecastFetchSuccessEvent | ForecastFetchFailureEvent;
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
