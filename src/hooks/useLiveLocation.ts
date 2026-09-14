import { useEffect, useRef, useState, useCallback } from 'react';
import { LocationCoordinates, PatientProfile } from '../types/triage';

export function useLiveLocation(
  onUpdateProfile: (updated: Partial<PatientProfile>) => void
) {
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'tracking' | 'denied' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasGeocodedRef = useRef<string>('');
  const onUpdateProfileRef = useRef(onUpdateProfile);
  onUpdateProfileRef.current = onUpdateProfile;

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const coordKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    if (hasGeocodedRef.current === coordKey) return;
    hasGeocodedRef.current = coordKey;

    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.city) {
          onUpdateProfileRef.current({
            locationCity: data.city,
            locationZip: data.zip || '',
          });
        }
      }
    } catch (e) {
      console.warn('Reverse geocode error:', e);
    }
  }, []);

  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation not supported by browser');
      return;
    }

    setIsTracking(true);
    setStatus('tracking');

    const handleSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed, altitude } = pos.coords;
      const coords: LocationCoordinates = {
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        heading,
        speed,
        altitude,
        timestamp: pos.timestamp,
      };

      onUpdateProfileRef.current({
        locationCoordinates: coords,
        isLiveTrackingLocation: true,
        locationTrackingStatus: 'tracking',
      });

      reverseGeocode(latitude, longitude);
    };

    const handleError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setStatus('denied');
        setErrorMsg('Location permission denied');
      } else {
        setStatus('error');
        setErrorMsg('GPS signal unavailable');
      }
      setIsTracking(false);
      onUpdateProfileRef.current({
        isLiveTrackingLocation: false,
        locationTrackingStatus: 'error',
      });
    };

    // Instant position fix
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    // Continuous real-time GPS watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [reverseGeocode]);

  useEffect(() => {
    startLiveTracking();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startLiveTracking]);

  return {
    isTracking,
    status,
    errorMsg,
    refreshLocation: startLiveTracking,
  };
}
