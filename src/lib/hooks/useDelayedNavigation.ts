import { useEffect } from 'react';

export function useDelayedNavigation() {
  const navigate = (path: string) => {
    // Force hard navigation
    window.location.replace(path);
  };

  const navigateWithDelay = (path: string, delay: number = 1000) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        navigate(path);
        resolve();
      }, delay);
    });
  };

  return { navigate, navigateWithDelay };
}