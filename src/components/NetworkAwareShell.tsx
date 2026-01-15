import { type ReactNode, useEffect, useState } from 'react';
import { ConnectivityBanner } from './ConnectivityBanner.tsx';

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
        <div className="sticky top-0 z-50 w-full px-space-lg py-space-2xs">
          <ConnectivityBanner
            title="Offline mode"
            description="Connection lost — showing the most recent cached forecast. We'll resync once you're back online."
            variant="offline"
            testId="offline-banner"
          />
        </div>
      ) : null}
      {children}
    </div>
  );
}
