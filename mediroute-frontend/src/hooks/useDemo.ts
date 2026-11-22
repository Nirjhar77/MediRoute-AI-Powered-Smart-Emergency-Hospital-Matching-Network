import { useEffect, useState, useMemo, useCallback } from 'react';
import { initialHospitals } from '../data/mockData';
import type { EmergencyRequest, Hospital, Role } from '../types';
import { useGPS } from '../context/GPSContext';
import { recalculateHospitalsDistance } from '../services/gps';
import {
  checkBackendHealth,
  fetchHospitalsFromAPI,
  updateHospitalInAPI,
  type HealthCheckResponse,
} from '../services/api';

export function useDemo() {
  const gps = useGPS();
  const [role, setRole] = useState<Role>(() => (localStorage.getItem('mr-role') as Role) || 'caregiver');
  const [backendStatus, setBackendStatus] = useState<HealthCheckResponse | null>(null);

  const [rawHospitals, setRawHospitals] = useState<Hospital[]>(() => {
    const s = localStorage.getItem('mr-hospitals');
    if (!s) return initialHospitals;
    try {
      const parsed = JSON.parse(s);
      if (!parsed.some((h: Hospital) => h.id === 'general-hospital-khulna')) {
        return initialHospitals;
      }
      return parsed;
    } catch (e) {
      return initialHospitals;
    }
  });

  const [request, setRequest] = useState<EmergencyRequest>({
    type: 'Trauma',
    requirements: ['Emergency Department', 'ICU', 'Ventilator', 'Oxygen', 'Surgery', 'Blood'],
    location: {
      lat: gps.coords.lat,
      lng: gps.coords.lng,
      label: gps.locationLabel,
    },
  });

  // Sync with FastAPI & PostgreSQL backend on load
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((health) => {
      if (isMounted && health) {
        setBackendStatus(health);
        // Fetch fresh hospital data from database
        fetchHospitalsFromAPI().then((apiHospitals) => {
          if (isMounted && apiHospitals && apiHospitals.length > 0) {
            setRawHospitals(apiHospitals);
          }
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keep request location in sync with real GPS updates
  useEffect(() => {
    setRequest((prev) => ({
      ...prev,
      location: {
        lat: gps.coords.lat,
        lng: gps.coords.lng,
        label: gps.locationLabel,
      },
    }));
  }, [gps.coords.lat, gps.coords.lng, gps.locationLabel]);

  // Dynamically compute real-time distance & driving time from current GPS coords
  const hospitals = useMemo(() => {
    return recalculateHospitalsDistance(rawHospitals, gps.coords.lat, gps.coords.lng);
  }, [rawHospitals, gps.coords.lat, gps.coords.lng]);

  useEffect(() => {
    localStorage.setItem('mr-hospitals', JSON.stringify(rawHospitals));
  }, [rawHospitals]);

  const login = (r: Role) => {
    setRole(r);
    localStorage.setItem('mr-role', r);
  };

  const updateHospital = useCallback((id: string, patch: Partial<Hospital>) => {
    setRawHospitals((xs: Hospital[]) =>
      xs.map((h: Hospital) => (h.id === id ? { ...h, ...patch, lastUpdated: 'just now' } : h))
    );

    // Persist update directly to FastAPI backend database
    updateHospitalInAPI(id, patch).catch(() => {});
  }, []);

  return {
    role,
    login,
    hospitals,
    setHospitals: setRawHospitals,
    request,
    setRequest,
    updateHospital,
    gps,
    backendStatus,
  };
}
