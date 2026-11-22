import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  type GPSCoordinates,
  type LocationPreset,
  KHULNA_GPS_PRESETS,
  reverseGeocode,
} from '../services/gps';

export type GPSStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error' | 'simulated';
export type GPSSource = 'hardware-gps' | 'preset' | 'manual' | 'default';

export interface GPSContextValue {
  coords: GPSCoordinates;
  status: GPSStatus;
  source: GPSSource;
  error: string | null;
  locationLabel: string;
  isLiveTracking: boolean;
  accuracyMeters: number | null;
  speedKmh: number | null;
  headingDegrees: number | null;
  lastUpdated: Date | null;
  // Actions
  requestRealGPS: () => Promise<boolean>;
  toggleLiveTracking: (enable?: boolean) => void;
  setPresetLocation: (preset: LocationPreset) => void;
  setManualLocation: (lat: number, lng: number, label?: string) => void;
  simulateAmbulanceMotion: (toLat: number, toLng: number) => void;
  stopAmbulanceMotion: () => void;
  isSimulatingMotion: boolean;
}

const DEFAULT_COORDS: GPSCoordinates = {
  lat: 22.8378,
  lng: 89.5403,
  accuracy: 10,
  heading: 0,
  speed: 0,
  timestamp: Date.now(),
};

const GPSContext = createContext<GPSContextValue | null>(null);

export const GPSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<GPSCoordinates>(() => {
    const saved = localStorage.getItem('mr-gps-coords');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_COORDS;
  });

  const [locationLabel, setLocationLabel] = useState<string>(() => {
    return localStorage.getItem('mr-gps-label') || 'Khulna Medical District — Boyra';
  });

  const [status, setStatus] = useState<GPSStatus>('idle');
  const [source, setSource] = useState<GPSSource>('default');
  const [error, setError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [isSimulatingMotion, setIsSimulatingMotion] = useState(false);

  const watchIdRef = useRef<number | null>(null);
  const motionTimerRef = useRef<number | null>(null);

  // Sync coords to localStorage
  useEffect(() => {
    localStorage.setItem('mr-gps-coords', JSON.stringify(coords));
    localStorage.setItem('mr-gps-label', locationLabel);
  }, [coords, locationLabel]);

  // Handle position success from browser geolocation API
  const handlePositionSuccess = useCallback(async (pos: GeolocationPosition, isWatch = false) => {
    const newCoords: GPSCoordinates = {
      lat: Number(pos.coords.latitude.toFixed(6)),
      lng: Number(pos.coords.longitude.toFixed(6)),
      accuracy: Math.round(pos.coords.accuracy || 8),
      altitude: pos.coords.altitude,
      heading: pos.coords.heading !== null && !isNaN(pos.coords.heading) ? Math.round(pos.coords.heading) : null,
      speed: pos.coords.speed !== null && !isNaN(pos.coords.speed) ? pos.coords.speed : 0,
      timestamp: pos.timestamp || Date.now(),
    };

    setCoords(newCoords);
    setStatus('active');
    setSource('hardware-gps');
    setError(null);
    setLastUpdated(new Date());

    // Only reverse geocode if not already doing rapid watch updates, or if coordinates shifted significantly
    reverseGeocode(newCoords.lat, newCoords.lng).then((label) => {
      setLocationLabel(label);
    });
  }, []);

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    setStatus(err.code === 1 ? 'denied' : 'error');
    let message = 'Unable to acquire real GPS fix.';
    if (err.code === 1) {
      message = 'GPS permission denied. Please allow location access in your browser.';
    } else if (err.code === 2) {
      message = 'GPS position unavailable. Check device GPS / location services.';
    } else if (err.code === 3) {
      message = 'GPS acquisition timed out. Re-trying...';
    }
    setError(message);
    setIsLiveTracking(false);
  }, []);

  // Request single real GPS position
  const requestRealGPS = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Geolocation API is not supported by your browser.');
      return false;
    }

    setStatus('requesting');
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePositionSuccess(pos);
          resolve(true);
        },
        (err) => {
          handlePositionError(err);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0,
        }
      );
    });
  }, [handlePositionSuccess, handlePositionError]);

  // Toggle continuous live tracking
  const toggleLiveTracking = useCallback((enable?: boolean) => {
    const shouldEnable = enable !== undefined ? enable : !isLiveTracking;

    if (!shouldEnable) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveTracking(false);
      return;
    }

    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Geolocation not supported');
      return;
    }

    setStatus('requesting');
    setIsLiveTracking(true);

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => handlePositionSuccess(pos, true),
        (err) => handlePositionError(err),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 1000,
        }
      );
    } catch (e) {
      setIsLiveTracking(false);
      setStatus('error');
      setError('Failed to initiate live GPS watcher.');
    }
  }, [isLiveTracking, handlePositionSuccess, handlePositionError]);

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (motionTimerRef.current !== null) {
        window.clearInterval(motionTimerRef.current);
      }
    };
  }, []);

  // Quick preset location
  const setPresetLocation = useCallback((preset: LocationPreset) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLiveTracking(false);
    }
    setCoords({
      lat: preset.lat,
      lng: preset.lng,
      accuracy: 5,
      heading: 45,
      speed: 0,
      timestamp: Date.now(),
    });
    setLocationLabel(`${preset.name} — ${preset.area}`);
    setStatus('simulated');
    setSource('preset');
    setError(null);
    setLastUpdated(new Date());
  }, []);

  // Manual location override
  const setManualLocation = useCallback((lat: number, lng: number, label?: string) => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLiveTracking(false);
    }
    const newCoords: GPSCoordinates = {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      accuracy: 8,
      heading: 0,
      speed: 0,
      timestamp: Date.now(),
    };
    setCoords(newCoords);
    setStatus('active');
    setSource('manual');
    setError(null);
    setLastUpdated(new Date());

    if (label) {
      setLocationLabel(label);
    } else {
      reverseGeocode(lat, lng).then((l) => setLocationLabel(l));
    }
  }, []);

  // Simulate an ambulance in transit moving step by step toward target coords
  const stopAmbulanceMotion = useCallback(() => {
    if (motionTimerRef.current !== null) {
      window.clearInterval(motionTimerRef.current);
      motionTimerRef.current = null;
    }
    setIsSimulatingMotion(false);
  }, []);

  const simulateAmbulanceMotion = useCallback(
    (toLat: number, toLng: number) => {
      stopAmbulanceMotion();
      setIsSimulatingMotion(true);
      setStatus('simulated');
      setSource('preset');

      let currentStep = 0;
      const totalSteps = 25;
      const startLat = coords.lat;
      const startLng = coords.lng;

      motionTimerRef.current = window.setInterval(() => {
        currentStep++;
        const progress = currentStep / totalSteps;
        const lat = startLat + (toLat - startLat) * progress;
        const lng = startLng + (toLng - startLng) * progress;

        // Calculate heading in degrees
        const dLng = toLng - startLng;
        const y = Math.sin(dLng) * Math.cos(toLat);
        const x =
          Math.cos(startLat) * Math.sin(toLat) -
          Math.sin(startLat) * Math.cos(toLat) * Math.cos(dLng);
        const headingDeg = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);

        setCoords({
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          accuracy: 4,
          speed: 11.2, // ~40 km/h in m/s
          heading: headingDeg,
          timestamp: Date.now(),
        });
        setLastUpdated(new Date());

        if (currentStep >= totalSteps) {
          stopAmbulanceMotion();
          setLocationLabel(`Arrived near target (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        }
      }, 800);
    },
    [coords.lat, coords.lng, stopAmbulanceMotion]
  );

  const speedKmh =
    coords.speed !== null && coords.speed !== undefined
      ? Math.round(coords.speed * 3.6)
      : 0;

  const value: GPSContextValue = {
    coords,
    status,
    source,
    error,
    locationLabel,
    isLiveTracking,
    accuracyMeters: coords.accuracy || null,
    speedKmh,
    headingDegrees: coords.heading ?? null,
    lastUpdated,
    requestRealGPS,
    toggleLiveTracking,
    setPresetLocation,
    setManualLocation,
    simulateAmbulanceMotion,
    stopAmbulanceMotion,
    isSimulatingMotion,
  };

  return <GPSContext.Provider value={value}>{children}</GPSContext.Provider>;
};

export function useGPS(): GPSContextValue {
  const context = useContext(GPSContext);
  if (!context) {
    throw new Error('useGPS must be used within a GPSProvider');
  }
  return context;
}
