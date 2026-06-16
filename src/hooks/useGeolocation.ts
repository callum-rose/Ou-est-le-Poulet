import { useCallback } from 'react';
import { appConfig } from '../config/app.config';
import { usePageVisibility } from './usePageVisibility';
import { useEffect, useRef } from 'react';
import { useGame } from '../state/GameContext';
import type { Breadcrumb, GeoStatus } from '../types';

const HIGH_ACCURACY_OPTS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 5000,
};

function crumbFrom(pos: GeolocationPosition): Breadcrumb {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    t: pos.timestamp || Date.now(),
    acc: pos.coords.accuracy,
  };
}

function statusFromError(err: GeolocationPositionError): GeoStatus {
  if (err.code === err.PERMISSION_DENIED) return 'denied';
  return 'unavailable';
}

/**
 * Geolocation controller. Exposes an imperative `sample()` for event-driven
 * captures (Ready tap, arrival, completion, found) and runs light foreground
 * polling. Pushes breadcrumbs into game state and tracks permission status.
 */
export function useGeolocation() {
  const { state, dispatch } = useGame();
  const visible = usePageVisibility();
  const geoStatusRef = useRef(state.geo.status);
  geoStatusRef.current = state.geo.status;

  const supported =
    typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const sample = useCallback((): Promise<Breadcrumb | null> => {
    if (!supported) {
      dispatch({ type: 'SET_GEO_STATUS', status: 'unavailable' });
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const crumb = crumbFrom(pos);
          dispatch({
            type: 'PUSH_BREADCRUMB',
            crumb,
            cap: appConfig.breadcrumbCap,
          });
          resolve(crumb);
        },
        (err) => {
          dispatch({ type: 'SET_GEO_STATUS', status: statusFromError(err) });
          resolve(null);
        },
        HIGH_ACCURACY_OPTS,
      );
    });
  }, [supported, dispatch]);

  // Light foreground polling. iOS suspends timers when locked/backgrounded —
  // we don't fight that; usePageVisibility pauses the interval.
  useEffect(() => {
    if (!supported) return;
    if (!visible) return;
    // Don't nag once the user has actively denied permission.
    if (geoStatusRef.current === 'denied') return;

    const id = setInterval(() => {
      void sample();
    }, appConfig.pollIntervalMs);
    return () => clearInterval(id);
  }, [supported, visible, sample]);

  return { sample, supported };
}
