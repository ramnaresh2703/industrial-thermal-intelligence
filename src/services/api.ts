/**
 * Full-Stack API client to communicate with the FastAPI backend.
 * Provides live connection for ML inference, TreeSHAP explainability, 
 * real NASA FIRMS satellite downlinks, and mobile SMS alert dispatch.
 */

const API_BASE_URL = 'http://localhost:8000';

export interface PredictPayload {
  frp: number;
  brightness_temp?: number;
  distance_to_industry: number;
  historical_persistence: number;
  land_cover: string;
  wind_speed?: number;
  latitude?: number;
  longitude?: number;
}

export interface SmsDispatchPayload {
  phone_number: string;
  agency?: string;
  hotspot: any;
  api_key?: string;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function predictHotspotApi(payload: PredictPayload) {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Prediction API request failed');
  return res.json();
}

export async function explainHotspotApi(payload: PredictPayload) {
  const res = await fetch(`${API_BASE_URL}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Explainability API request failed');
  return res.json();
}

export async function fetchLiveFirmsAnomalies(sector = 'IND', days = 3) {
  const res = await fetch(`${API_BASE_URL}/api/firms/sync?sector=${sector}&days=${days}`);
  if (!res.ok) throw new Error('NASA FIRMS satellite downlink failed');
  return res.json();
}

export async function sendEmergencySms(payload: SmsDispatchPayload) {
  const res = await fetch(`${API_BASE_URL}/api/alerts/sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Emergency SMS dispatch failed');
  return res.json();
}

export async function fetchBackendStats() {
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
