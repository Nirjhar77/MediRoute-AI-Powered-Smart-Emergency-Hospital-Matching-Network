/**
 * MediRoute Real-time GPS & Geodesic Distance Service
 *
 * Implements:
 * 1. High-precision Haversine distance formula (great-circle km)
 * 2. Urban driving road distance & ETA estimation (road tortuosity factor + traffic curve)
 * 3. Live OSRM (Open Source Routing Machine) routing with fallback to mathematical routing
 * 4. Reverse geocoding via OpenStreetMap Nominatim with local cache
 * 5. Dynamic hospital recalculation from live GPS coordinates
 */

import type { Hospital } from '../types';

export interface GPSCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // in meters
  altitude?: number | null;
  heading?: number | null; // degrees 0-360
  speed?: number | null; // meters/sec
  timestamp?: number;
}

export interface RouteInfo {
  distanceKm: number;
  durationMins: number;
  geometry?: [number, number][]; // [lat, lng] array for Leaflet polyline
  source: 'osrm' | 'haversine-model';
}

const EARTH_RADIUS_KM = 6371.0088;
const URBAN_ROAD_FACTOR = 1.28; // Urban road network circuity index
const AVERAGE_URBAN_SPEED_KMH = 26; // Realistic emergency transit speed in congested urban streets

/**
 * Calculates straight-line distance in kilometers between two GPS coordinates using Haversine formula.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = EARTH_RADIUS_KM * c;
  return Number(d.toFixed(2));
}

/**
 * Mathematical model for driving road distance and travel time.
 * Accounts for road network curves, traffic, and traffic light delays.
 */
export function calculateEstimatedDriving(
  straightKm: number
): { distanceKm: number; durationMins: number } {
  // Road network distance is ~28% longer than straight-line as the crow flies
  const roadDist = Math.max(0.1, straightKm * URBAN_ROAD_FACTOR);

  // Time calculation: (distance / speed) in hours * 60 + 1 min triage/signal dispatch buffer
  const hours = roadDist / AVERAGE_URBAN_SPEED_KMH;
  const minutes = Math.max(1, Math.round(hours * 60 + 1));

  return {
    distanceKm: Number(roadDist.toFixed(1)),
    durationMins: minutes,
  };
}

// In-memory cache for reverse geocoding to prevent excessive API hits
const geocodeCache = new Map<string, string>();

/**
 * Reverse geocodes coordinates to a human-readable address via OpenStreetMap Nominatim.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'MediRoute-Emergency-Navigator/1.0',
        },
      }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();

    const addr = data.address || {};
    const parts = [
      addr.suburb || addr.neighbourhood || addr.road || addr.quarter,
      addr.city || addr.town || addr.district || addr.county || 'Khulna',
    ].filter(Boolean);

    const label = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 2).join(',') || `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    geocodeCache.set(cacheKey, label);
    return label;
  } catch (err) {
    const fallback = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    geocodeCache.set(cacheKey, fallback);
    return fallback;
  }
}

// Route cache to avoid spamming OSRM for identical origin/destination
const routeCache = new Map<string, RouteInfo>();

/**
 * Fetches real driving route from OSRM public API with fallback to Haversine model.
 */
export async function getDrivingRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteInfo> {
  const cacheKey = `${fromLat.toFixed(3)},${fromLng.toFixed(3)}-${toLat.toFixed(3)},${toLng.toFixed(3)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  const straight = calculateHaversineDistance(fromLat, fromLng, toLat, toLng);
  const estimated = calculateEstimatedDriving(straight);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    // OSRM coordinates format: {lon},{lat}
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const distanceKm = Number((route.distance / 1000).toFixed(1));
        const durationMins = Math.max(1, Math.round(route.duration / 60));
        
        // GeoJSON coordinates are [lon, lat], Leaflet polyline expects [lat, lon]
        const geometry: [number, number][] = (route.geometry?.coordinates || []).map(
          (c: [number, number]) => [c[1], c[0]]
        );

        const result: RouteInfo = {
          distanceKm,
          durationMins,
          geometry,
          source: 'osrm',
        };
        routeCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (e) {
    // Offline or request aborted, use mathematical estimate
  }

  const fallbackResult: RouteInfo = {
    distanceKm: estimated.distanceKm,
    durationMins: estimated.durationMins,
    geometry: [
      [fromLat, fromLng],
      [toLat, toLng],
    ],
    source: 'haversine-model',
  };
  routeCache.set(cacheKey, fallbackResult);
  return fallbackResult;
}

/**
 * Recomputes dynamic distance and travel time for a list of hospitals
 * based on the user's real GPS position.
 */
export function recalculateHospitalsDistance(
  hospitals: Hospital[],
  userLat: number,
  userLng: number
): Hospital[] {
  return hospitals.map((h) => {
    const straightKm = calculateHaversineDistance(userLat, userLng, h.lat, h.lng);
    const driving = calculateEstimatedDriving(straightKm);

    return {
      ...h,
      distance: driving.distanceKm,
      travelTime: driving.durationMins,
    };
  });
}

/**
 * Quick GPS Location Presets in Khulna Division for testing & simulation
 */
export interface LocationPreset {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  description: string;
}

export const KHULNA_GPS_PRESETS: LocationPreset[] = [
  {
    id: 'boyra',
    name: 'Boyra Medical District',
    area: 'Boyra, Khulna',
    lat: 22.8378,
    lng: 89.5403,
    description: 'Central hospital hub near KMCH and Boyra intersection',
  },
  {
    id: 'sonadanga',
    name: 'Sonadanga Central Bus Terminal',
    area: 'Sonadanga, Khulna',
    lat: 22.8228,
    lng: 89.5441,
    description: 'High-traffic commercial and inter-district transport junction',
  },
  {
    id: 'khulna-sadar',
    name: 'Khulna Sadar / Dakbangla',
    area: 'Khulna Sadar, Khulna',
    lat: 22.8125,
    lng: 89.5638,
    description: 'Downtown commercial center and river ghat access',
  },
  {
    id: 'daulatpur',
    name: 'Daulatpur Industrial Zone',
    area: 'Daulatpur, Khulna',
    lat: 22.8712,
    lng: 89.5224,
    description: 'Northern suburb and industrial district corridor',
  },
  {
    id: 'khalishpur',
    name: 'Khalishpur Residential Zone',
    area: 'Khalishpur, Khulna',
    lat: 22.8556,
    lng: 89.5315,
    description: 'Dense residential neighborhood west of Mujgunni',
  },
  {
    id: 'zero-point',
    name: 'Khulna University / Zero Point',
    area: 'Gollamari, Khulna',
    lat: 22.7989,
    lng: 89.5342,
    description: 'Southern gateway connecting Khulna University and Satkhira Highway',
  },
];
