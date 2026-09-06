export interface DailyDetection {
  date: string;
  totalHotspots: number;
  criticalAlerts: number;
  industrialFires: number;
  refineryFlares: number;
  forestFires: number;
  agriculturalBurns: number;
  thermalPower: number;
}

export const DAILY_DETECTIONS_DATA: DailyDetection[] = [
  { date: 'Aug 28', totalHotspots: 142, criticalAlerts: 4, industrialFires: 3, refineryFlares: 62, forestFires: 12, agriculturalBurns: 41, thermalPower: 24 },
  { date: 'Aug 29', totalHotspots: 156, criticalAlerts: 6, industrialFires: 5, refineryFlares: 65, forestFires: 18, agriculturalBurns: 44, thermalPower: 24 },
  { date: 'Aug 30', totalHotspots: 189, criticalAlerts: 9, industrialFires: 7, refineryFlares: 68, forestFires: 28, agriculturalBurns: 62, thermalPower: 24 },
  { date: 'Aug 31', totalHotspots: 164, criticalAlerts: 5, industrialFires: 4, refineryFlares: 64, forestFires: 15, agriculturalBurns: 57, thermalPower: 24 },
  { date: 'Sep 01', totalHotspots: 178, criticalAlerts: 8, industrialFires: 6, refineryFlares: 69, forestFires: 22, agriculturalBurns: 57, thermalPower: 24 },
  { date: 'Sep 02', totalHotspots: 205, criticalAlerts: 12, industrialFires: 8, refineryFlares: 71, forestFires: 34, agriculturalBurns: 68, thermalPower: 24 },
  { date: 'Sep 03 (Today)', totalHotspots: 194, criticalAlerts: 11, industrialFires: 9, refineryFlares: 70, forestFires: 31, agriculturalBurns: 60, thermalPower: 24 },
];

export const CATEGORY_DISTRIBUTION_DATA = [
  { category: 'Refinery Flares', count: 70, avgFrp: 215, color: '#3b82f6', riskTier: 'Baseline / Low' },
  { category: 'Agricultural Burns', count: 60, avgFrp: 92, color: '#16a34a', riskTier: 'Low / Monitored' },
  { category: 'Forest Wildfires', count: 31, avgFrp: 284, color: '#f59e0b', riskTier: 'High / Critical' },
  { category: 'Thermal Power', count: 24, avgFrp: 540, color: '#8b5cf6', riskTier: 'Regulated Baseline' },
  { category: 'Industrial Fires', count: 9, avgFrp: 385, color: '#dc2626', riskTier: 'Critical Hazard' },
  { category: 'Steel/Smelting', count: 14, avgFrp: 590, color: '#f97316', riskTier: 'Monitored Baseline' },
];

export const STATE_HOTSPOT_DATA = [
  { state: 'Tamil Nadu', total: 48, critical: 4, highRisk: 6, baseline: 38 },
  { state: 'Gujarat', total: 64, critical: 2, highRisk: 5, baseline: 57 },
  { state: 'Maharashtra', total: 52, critical: 3, highRisk: 6, baseline: 43 },
  { state: 'Odisha', total: 51, critical: 3, highRisk: 8, baseline: 40 },
  { state: 'Punjab (Stubble)', total: 72, critical: 1, highRisk: 12, baseline: 59 },
  { state: 'Andhra Pradesh', total: 36, critical: 3, highRisk: 4, baseline: 29 },
  { state: 'Madhya Pradesh', total: 42, critical: 2, highRisk: 7, baseline: 33 },
  { state: 'Karnataka', total: 34, critical: 1, highRisk: 4, baseline: 29 },
  { state: 'Assam & NE', total: 28, critical: 1, highRisk: 3, baseline: 24 },
];

export const RISK_LEVEL_PIE_DATA = [
  { name: 'Critical Alert (>85)', value: 14, color: '#dc2626' },
  { name: 'High Priority (70-85)', value: 28, color: '#f97316' },
  { name: 'Moderate Watch (40-69)', value: 65, color: '#f59e0b' },
  { name: 'Controlled Baseline (<40)', value: 187, color: '#16a34a' },
];

export const GLOBAL_SHAP_IMPORTANCE = [
  { feature: 'Proximity to Industrial Asset (m)', importance: 0.38, category: 'Spatial' },
  { feature: '30-Day Historical Persistence (%)', importance: 0.32, category: 'Temporal' },
  { feature: 'Fire Radiative Power (MW)', importance: 0.29, category: 'Radiometry' },
  { feature: 'Land Cover Classification Type', importance: 0.24, category: 'Geospatial' },
  { feature: 'Pixel Peak Brightness Temp (K)', importance: 0.21, category: 'Radiometry' },
  { feature: 'Detection Time vs Operating Hours', importance: 0.17, category: 'Temporal' },
  { feature: 'Surface Wind Vector (km/h)', importance: 0.14, category: 'Meteorology' },
  { feature: 'Vegetation Water Index (NDWI)', importance: 0.11, category: 'Biomass' },
];

export const HOURLY_DIURNAL_CYCLE = [
  { hour: '00:00', flares: 68, wildfires: 6, industrial: 2, agro: 1 },
  { hour: '04:00', flares: 69, wildfires: 8, industrial: 3, agro: 2 },
  { hour: '08:00', flares: 70, wildfires: 15, industrial: 4, agro: 18 },
  { hour: '12:00', flares: 71, wildfires: 32, industrial: 8, agro: 54 },
  { hour: '16:00', flares: 72, wildfires: 28, industrial: 6, agro: 48 },
  { hour: '20:00', flares: 70, wildfires: 14, industrial: 4, agro: 12 },
];
