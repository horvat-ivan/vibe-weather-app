import { useCallback, useEffect, useState } from 'react';
import {
  logShareAttempt,
  logShareFailure,
  logShareSuccess,
  type ShareMethod,
} from '../../lib/analytics.ts';
import { useLocationService } from '../location/locationContext.tsx';

const SHARE_DISMISS_DELAY_MS = 4000;

export type ShareFeedback = {
  type: 'success' | 'error';
  message: string;
};

function resolveShareMethod(): ShareMethod {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    return 'web-share';
  }
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    return 'clipboard';
  }
  return 'unsupported';
}

export function useShareVibe() {
  const {
    state: { selectedLocation },
  } = useLocationService();
  const [feedback, setFeedback] = useState<ShareFeedback | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!feedback || typeof window === 'undefined') {
      return;
    }
    const timeout = window.setTimeout(() => setFeedback(null), SHARE_DISMISS_DELAY_MS);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [feedback]);

  const shareVibe = useCallback(async () => {
    if (isSharing) {
      return;
    }
    setIsSharing(true);
    const method = resolveShareMethod();
    const basePayload = {
      method,
      locationId: selectedLocation.id,
      vibe: selectedLocation.vibe,
    } as const;

    const vibeSummary = `${selectedLocation.name} · ${selectedLocation.vibe}`;
    const summaryLine = selectedLocation.summary || 'Dialing in the vibe forecast.';
    const shareUrl = typeof window !== 'undefined' ? window.location.href : undefined;
    const text = `${vibeSummary}\n${summaryLine}`;

    const setSuccess = (message: string) => setFeedback({ type: 'success', message });
    const setError = () =>
      setFeedback({ type: 'error', message: 'Unable to share right now. Copy the link manually.' });

    logShareAttempt(basePayload);

    try {
      if (method === 'web-share') {
        await navigator.share({
          title: `Vibe Weather — ${selectedLocation.name}`,
          text,
          url: shareUrl,
        });
        setSuccess('Vibe shared successfully.');
        logShareSuccess(basePayload);
        return;
      }

      if (method === 'clipboard' && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}${shareUrl ? `\n${shareUrl}` : ''}`);
        setSuccess('Vibe link copied to clipboard.');
        logShareSuccess(basePayload);
        return;
      }

      const failureMessage = 'Sharing is not supported on this device.';
      logShareFailure({ ...basePayload, message: failureMessage });
      setError();
    } catch (_error) {
      const message = _error instanceof Error ? _error.message : 'Unable to share right now.';
      logShareFailure({ ...basePayload, message });
      setError();
    } finally {
      setIsSharing(false);
    }
  }, [
    isSharing,
    selectedLocation.id,
    selectedLocation.name,
    selectedLocation.summary,
    selectedLocation.vibe,
  ]);

  return {
    shareVibe,
    feedback,
    isSharing,
  };
}
