import { type ReactNode, useEffect, useState } from 'react';

export function NetworkAwareShell({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {!isOnline ? (
        <output
          aria-live="polite"
          className="sticky top-0 z-50 w-full bg-brand-twilight/90 text-center text-sm text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <p className="px-space-md py-space-2xs" data-testid="offline-banner">
            You are offline. Showing the most recent cached forecast.
          </p>
        </output>
      ) : null}
      {children}
    </div>
  );
}
