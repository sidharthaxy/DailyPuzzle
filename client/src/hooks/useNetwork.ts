import { useState, useEffect } from 'react';

export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
