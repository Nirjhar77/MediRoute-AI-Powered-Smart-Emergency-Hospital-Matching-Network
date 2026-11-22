import type { Hospital, EmergencyRequest } from '../types';

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

export interface HealthCheckResponse {
  status: string;
  database: string;
  isPostgres: boolean;
  version: string;
}

export interface NetworkInfoResponse {
  lan_ip: string;
  frontend_port: number;
  backend_port: number;
  mobile_url: string;
}

export async function fetchServerNetworkInfo(): Promise<NetworkInfoResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/system/network`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


/**
 * Checks connection health to the FastAPI backend and PostgreSQL database.
 */
export async function checkBackendHealth(): Promise<HealthCheckResponse | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Fetches all hospitals from FastAPI + PostgreSQL database.
 */
export async function fetchHospitalsFromAPI(lat?: number, lng?: number): Promise<Hospital[] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const params = lat !== undefined && lng !== undefined ? `?lat=${lat}&lng=${lng}` : '';
    const res = await fetch(`${API_BASE_URL}/api/hospitals${params}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return data.map((h: any) => ({
      ...h,
      lastUpdated: h.lastUpdated || h.last_updated || 'just now',
      emergencyOpen: h.emergencyOpen ?? h.emergency_open ?? true,
      travelTime: h.travelTime ?? h.travel_time ?? 8,
      bloodBank: h.bloodBank ?? h.blood_bank ?? false,
    }));
  } catch (e) {
    return null;
  }
}

/**
 * Updates a hospital's resource capacity in the PostgreSQL database.
 */
export async function updateHospitalInAPI(
  id: string,
  patch: Partial<Hospital>
): Promise<Hospital | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/hospitals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Runs intelligent capability matching and distance scoring on the FastAPI backend.
 */
export async function matchEmergencyViaAPI(req: EmergencyRequest): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}
