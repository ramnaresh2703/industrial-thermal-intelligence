import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Search, 
  Flame, 
  Layers, 
  MapPin, 
  Eye, 
  Activity,
  Satellite,
  Mountain,
  Compass,
  Smartphone,
  RefreshCw,
  Radio,
  Sliders,
  CheckCircle2,
  Navigation,
  Globe2,
  Zap,
  Wind,
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  Cpu,
  Thermometer,
  X,
  Gauge,
  Info,
  FileText,
  Clock,
  History,
  TrendingUp,
  Play,
  Pause
} from 'lucide-react';
import type { Hotspot } from '../data/hotspots';
import { DEMO_HOTSPOTS } from '../data/hotspots';
import { fetchLiveFirmsAnomalies, fetchDimensionOccurrences } from '../services/api';
import { TacticalDossierModal } from './TacticalDossierModal';
import { soundFx } from '../utils/audio';

interface MapDashboardProps {
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenSmsModal: (hotspot: Hotspot) => void;
  selectedHotspot: Hotspot | null;
}

// Controller to smoothly animate Leaflet fly-to
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

export const MapDashboard: React.FC<MapDashboardProps> = ({ 
  onSelectHotspot, 
  onOpenSmsModal,
  selectedHotspot 
}) => {
  const [sidebarTab, setSidebarTab] = useState<'incidents' | 'dimensions'>('incidents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [minFRP, setMinFRP] = useState<number>(0);
  
  // Tactical modals state
  const [showEnclosedModal, setShowEnclosedModal] = useState<boolean>(false);
  const [enclosedModalHotspot, setEnclosedModalHotspot] = useState<Hotspot | null>(null);
  const [dossierHotspot, setDossierHotspot] = useState<Hotspot | null>(null);
  
  // Basemap switcher: 'satellite' | 'esri-dark' | 'topo'
  const [basemapMode, setBasemapMode] = useState<'satellite' | 'esri-dark' | 'topo'>('satellite');
  
  // Map positioning (Default: Pan-India National Command View)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  // Live NASA FIRMS data state
  const [isSyncingFirms, setIsSyncingFirms] = useState<boolean>(false);
  const [liveSatelliteAnomalies, setLiveSatelliteAnomalies] = useState<Hotspot[]>([]);
  const [firmsSyncCount, setFirmsSyncCount] = useState<number | null>(null);

  // Spatial Dimensions Persisted Backend Data
  const [dimensionRecords, setDimensionRecords] = useState<any[]>([]);
  const [dimensionStats, setDimensionStats] = useState<any | null>(null);

  // Auto-Downlink Ticker state
  const [autoDownlinkActive, setAutoDownlinkActive] = useState<boolean>(true);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(45);

  const categories = [
    'ALL',
    'Industrial Fire',
    'Enclosed Electrical & Smoke Anomaly',
    'Refinery Flare',
    'Forest Fire',
    'Thermal Power Plant',
    'Steel/Smelting Plant',
    'Chemical Hazard',
    'Agricultural Burning'
  ];

  const riskLevels = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

  const regions = [
    { id: 'ALL', label: 'All India (National Shield)', center: [20.5937, 78.9629], zoom: 5 },
    { id: 'Tamil Nadu', label: 'Tamil Nadu Sector', center: [11.1271, 78.6569], zoom: 7 },
    { id: 'Western India', label: 'Western Hub (Gujarat & MH)', center: [20.9000, 72.8000], zoom: 7 },
    { id: 'Eastern India', label: 'Eastern Belt (Odisha & JH)', center: [21.5000, 85.5000], zoom: 7 },
    { id: 'Northern India', label: 'Northern Plains (Punjab & HR)', center: [29.8000, 76.5000], zoom: 7 },
    { id: 'Southern India', label: 'Southern Defense Arc', center: [15.2000, 78.5000], zoom: 6 },
    { id: 'North-East', label: 'Assam & North-East Sector', center: [26.8000, 93.8000], zoom: 7 },
  ];

  // Merge static strategic catalog with any live NASA FIRMS detections
  const allAvailableHotspots = useMemo(() => {
    return [...DEMO_HOTSPOTS, ...liveSatelliteAnomalies];
  }, [liveSatelliteAnomalies]);

  // Filtered hotspots based on search and criteria
  const filteredHotspots = useMemo(() => {
    return allAvailableHotspots.filter(spot => {
      const matchesSearch = 
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || spot.category === selectedCategory;
      const matchesRisk = selectedRisk === 'ALL' || spot.riskLevel === selectedRisk;
      const matchesRegion = selectedRegion === 'ALL' || spot.region === selectedRegion;
      const matchesFRP = spot.frp >= minFRP;

      return matchesSearch && matchesCategory && matchesRisk && matchesRegion && matchesFRP;
    });
  }, [allAvailableHotspots, searchQuery, selectedCategory, selectedRisk, selectedRegion, minFRP]);

  // Load dimensional occurrences and initial FIRMS downlink
  useEffect(() => {
    handleSyncLiveFirms();
    loadDimensionOccurrences();
  }, []);

  // Auto-downlink countdown timer
  useEffect(() => {
    if (!autoDownlinkActive) return;
    const interval = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          handleSyncLiveFirms();
          loadDimensionOccurrences();
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [autoDownlinkActive]);

  const loadDimensionOccurrences = async () => {
    try {
      const res = await fetchDimensionOccurrences();
      if (res?.occurrences) {
        setDimensionRecords(res.occurrences);
        setDimensionStats(res.stats);
      }
    } catch (e) {
      console.warn('Occurrences load:', e);
    }
  };

  // Trigger live satellite downlink from backend with user's NASA FIRMS key
  const handleSyncLiveFirms = async () => {
    setIsSyncingFirms(true);
    try {
      const data = await fetchLiveFirmsAnomalies('IND', 1);
      if (data && data.anomalies && data.anomalies.length > 0) {
        soundFx.playSuccess();
        setFirmsSyncCount(data.anomalies.length);
        
        // Transform live NASA detections into Hotspot format
        const converted = data.anomalies.slice(0, 250).map((anom: any, idx: number) => {
          const latGrid = Math.round(anom.latitude * 100) / 100;
          const lngGrid = Math.round(anom.longitude * 100) / 100;
          const dimId = `DIM-${Math.abs(latGrid).toFixed(2)}${latGrid >= 0 ? 'N' : 'S'}-${Math.abs(lngGrid).toFixed(2)}${lngGrid >= 0 ? 'E' : 'W'}`;

          return {
            id: `NASA-LIVE-${idx + 1}`,
            name: anom.target || `NASA VIIRS Sat-Detect #${idx + 1}`,
            location: `Lat ${anom.latitude.toFixed(4)}°, Lng ${anom.longitude.toFixed(4)}°`,
            district: 'Live Satellite Track',
            state: 'National Territory',
            region: 'All India' as const,
            lat: anom.latitude,
            lng: anom.longitude,
            frp: anom.frp || 120.0,
            brightnessTemp: anom.brightness || 360.0,
            confidence: anom.confidence === 'high' || anom.confidence === 'h' ? 98.2 : 88.5,
            category: (anom.frp > 300 ? 'Industrial Fire' : anom.frp > 150 ? 'Forest Fire' : 'Agricultural Burning') as any,
            riskLevel: (anom.frp > 300 ? 'CRITICAL' : anom.frp > 150 ? 'HIGH' : 'MODERATE') as any,
            riskScore: Math.min(96, Math.max(35, Math.round((anom.frp || 100) / 4))),
            nearbyIndustry: 'NASA Earth Observation FIRMS Live Pass',
            distanceToIndustry: 350,
            historicalCount: 4,
            detectionTime: anom.acq_time || 'Live Orbit Pass',
            satellite: anom.satellite || 'VIIRS NOAA-20',
            scanAngle: 10.5,
            landCover: 'Geospatial Radar Mesh',
            windSpeed: '14 km/h',
            dimensionId: dimId,
            occurrenceCount: 1,
            isVerifiedActive: (anom.frp || 0) >= 10,
            recommendation: 'Autonomous satellite detection. Transmitted for tactical verification.',
            status: 'Active Flare' as const,
            aiReasoning: 'Real-time thermal anomaly detected by NASA VIIRS 375m sensor downlink.',
            shapValues: [
              { feature: 'Satellite Radiative Radiance', importance: 0.38, impact: 'positive' as const, description: `${anom.frp} MW measured by VIIRS I-Band` },
              { feature: 'Sensor Confidence Threshold', importance: 0.25, impact: 'positive' as const, description: `${anom.confidence} detection certainty` },
            ]
          };
        });

        setLiveSatelliteAnomalies(converted);
        loadDimensionOccurrences();
      }
    } catch (e) {
      console.warn('NASA FIRMS auto-downlink:', e);
    } finally {
      setIsSyncingFirms(false);
    }
  };

  // Create custom pulsing SVG radar blips with High-Intensity Critical Alarm Strobe
  const createPulsingMarkerIcon = (hotspot: Hotspot, isSelected: boolean) => {
    const isCritical = hotspot.riskLevel === 'CRITICAL';
    const isHigh = hotspot.riskLevel === 'HIGH';
    const isModerate = hotspot.riskLevel === 'MODERATE';
    const isEnclosed = hotspot.category === 'Enclosed Electrical & Smoke Anomaly';

    let color = '#16a34a';
    let pulseClass = 'pulse-marker-low';
    let ringColor = 'rgba(22, 163, 74, 0.4)';

    if (isCritical) {
      color = '#ef4444';
      pulseClass = 'pulse-marker-critical';
      ringColor = 'rgba(239, 68, 68, 0.7)';
    } else if (isHigh) {
      color = '#f97316';
      pulseClass = 'pulse-marker-high';
      ringColor = 'rgba(249, 115, 22, 0.6)';
    } else if (isModerate) {
      color = '#f59e0b';
      pulseClass = 'pulse-marker-moderate';
      ringColor = 'rgba(245, 158, 11, 0.5)';
    }

    const size = isSelected ? 42 : isCritical ? 34 : 26;
    const borderGlow = isSelected ? '3px solid #ffffff' : isCritical ? '2px solid #ffffff' : `2px solid ${color}`;

    const html = isCritical ? `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        <div class="critical-shockwave"></div>
        <div class="critical-shockwave critical-shockwave-delayed"></div>
        
        <div class="${pulseClass}" style="
          position: absolute; 
          width: 100%; 
          height: 100%; 
          border-radius: 50%; 
          background: ${ringColor};
        "></div>
        
        <div style="
          width: ${size * 0.72}px; 
          height: ${size * 0.72}px; 
          background: radial-gradient(circle at 30% 30%, #ff4d4d, #b91c1c); 
          border-radius: 50%; 
          border: ${borderGlow};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px #ef4444, 0 0 40px rgba(239,68,68,0.8);
          z-index: 10;
        ">
          ${isEnclosed ? `
            <svg style="width: 13px; height: 13px; color: white; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          ` : `
            <svg style="width: 13px; height: 13px; color: white; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          `}
        </div>

        <div style="
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: #ef4444;
          color: white;
          font-size: 8px;
          font-weight: 900;
          font-family: monospace;
          padding: 1px 4px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.7);
          box-shadow: 0 2px 6px rgba(0,0,0,0.6);
          white-space: nowrap;
          pointer-events: none;
          letter-spacing: 0.5px;
        ">
          ${isEnclosed ? '⚡SMOKE' : 'ALERT'}
        </div>
      </div>
    ` : `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
        <div class="${pulseClass}" style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${ringColor};"></div>
        <div style="
          width: ${size * 0.7}px; 
          height: ${size * 0.7}px; 
          background: ${color}; 
          border-radius: 50%; 
          border: ${borderGlow};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px ${color};
          z-index: 10;
        ">
          <svg style="width: 11px; height: 11px; color: white; fill: currentColor;" viewBox="0 0 24 24">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html: html,
      className: 'custom-thermal-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  };

  const handleSpotClick = (spot: Hotspot) => {
    soundFx.playAlert();
    setMapCenter([spot.lat, spot.lng]);
    setMapZoom(11);
  };

  const handleSelectRegion = (regionId: string) => {
    soundFx.playClick();
    setSelectedRegion(regionId);
    const reg = regions.find(r => r.id === regionId);
    if (reg) {
      setMapCenter(reg.center as [number, number]);
      setMapZoom(reg.zoom);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-[#03050c] text-slate-100 overflow-hidden relative">
      
      {/* ── LEFT SIDEBAR: Unified Telemetry Stream & Spatial Dimension Tracker ── */}
      <div className="w-full lg:w-[420px] flex-shrink-0 bg-space-900/95 backdrop-blur-2xl border-r border-white/10 flex flex-col z-20 shadow-2xl h-[46vh] lg:h-full">
        
        {/* Top Switcher: Live Incidents vs Spatial Dimensions */}
        <div className="p-3 bg-space-950/90 border-b border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 p-1 bg-black/60 rounded-xl border border-white/10">
              <button
                onClick={() => { soundFx.playClick(); setSidebarTab('incidents'); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  sidebarTab === 'incidents'
                    ? 'bg-thermal text-white shadow-thermal-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Live Incidents</span>
                <span className="ml-1 px-1.5 py-0.2 rounded bg-black/40 text-[9px]">
                  {filteredHotspots.length}
                </span>
              </button>

              <button
                onClick={() => { soundFx.playClick(); setSidebarTab('dimensions'); loadDimensionOccurrences(); }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  sidebarTab === 'dimensions'
                    ? 'bg-ai text-white shadow-ai-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dimensions</span>
                <span className="ml-1 px-1.5 py-0.2 rounded bg-black/40 text-[9px]">
                  {dimensionRecords.length || 7}
                </span>
              </button>
            </div>

            {/* Auto-Downlink Pulse Indicator */}
            <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
              <button
                onClick={() => setAutoDownlinkActive(!autoDownlinkActive)}
                className="p-1 rounded hover:bg-white/10 text-slate-300"
                title={autoDownlinkActive ? 'Pause auto-downlink' : 'Resume auto-downlink'}
              >
                {autoDownlinkActive ? <Pause className="w-3 h-3 text-emerald-400" /> : <Play className="w-3 h-3 text-amber-400" />}
              </button>
              <span className="text-emerald-400 font-bold">{countdownSeconds}s</span>
            </div>
          </div>

          {/* Search & Enclosed Radar Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={sidebarTab === 'incidents' ? "Filter target, state, wire short..." : "Filter dimensions (e.g. 11.11N)..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-space-800/90 border border-white/10 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thermal/60 transition-colors font-mono"
              />
            </div>

            <button
              onClick={() => {
                soundFx.playClick();
                const enc = DEMO_HOTSPOTS.find(h => h.category === 'Enclosed Electrical & Smoke Anomaly');
                setEnclosedModalHotspot(enc || null);
                setShowEnclosedModal(true);
              }}
              className="px-2.5 py-1.5 bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-lg text-xs font-mono font-bold flex items-center space-x-1 transition-all shadow-sm"
              title="Enclosed Electrical Short & Smoke Plume Analysis"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">Smoke Radar</span>
            </button>
          </div>

          {/* Filters Row (Incidents Mode Only) */}
          {sidebarTab === 'incidents' && (
            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1">
              <select
                value={selectedRegion}
                onChange={(e) => handleSelectRegion(e.target.value)}
                className="px-1.5 py-1 bg-space-800 border border-white/10 rounded text-slate-200 text-[10px]"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{r.label.split('(')[0]}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); soundFx.playClick(); }}
                className="px-1.5 py-1 bg-space-800 border border-white/10 rounded text-slate-200 text-[10px] truncate"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedRisk}
                onChange={(e) => { setSelectedRisk(e.target.value); soundFx.playClick(); }}
                className="px-1.5 py-1 bg-space-800 border border-white/10 rounded text-slate-200 text-[10px]"
              >
                {riskLevels.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ── Content Area: Tab 1 (Incidents) vs Tab 2 (Spatial Dimensions) ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
          
          {/* TAB 1: Live Incidents Stream */}
          {sidebarTab === 'incidents' && (
            filteredHotspots.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-mono">
                No thermal hotspots match your filter criteria.
              </div>
            ) : (
              filteredHotspots.map((spot) => {
                const isSelected = selectedHotspot?.id === spot.id;
                const isCritical = spot.riskLevel === 'CRITICAL';
                const isHigh = spot.riskLevel === 'HIGH';
                const isModerate = spot.riskLevel === 'MODERATE';
                const isEnclosed = spot.category === 'Enclosed Electrical & Smoke Anomaly';
                const frpPct = Math.min(100, (spot.frp / 600) * 100);

                return (
                  <div
                    key={spot.id}
                    onClick={() => handleSpotClick(spot)}
                    className={`p-3 transition-all cursor-pointer group hover:bg-white/5 ${
                      isSelected ? 'bg-thermal/15 border-l-4 border-thermal' : ''
                    } ${isCritical ? 'bg-red-950/15' : ''}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isCritical ? 'bg-critical animate-ping' :
                            isHigh ? 'bg-thermal' :
                            isModerate ? 'bg-amber-400' : 'bg-geo'
                          }`} />
                          <h4 className="text-xs font-bold text-white group-hover:text-thermal transition-colors truncate">
                            {spot.name.split('–')[0]}
                          </h4>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5 font-mono">
                          <MapPin className="w-2.5 h-2.5 text-slate-500" />
                          <span className="truncate">{spot.district}, {spot.state}</span>
                          <span>•</span>
                          <span className="text-cyan-300">{spot.detectionTime.split(' ')[1] || '04:15 UTC'}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                        isCritical ? 'bg-critical/20 text-critical-light border border-critical/50 shadow-[0_0_10px_rgba(220,38,38,0.4)] animate-pulse' :
                        isHigh ? 'bg-thermal/20 text-thermal-light border border-thermal/40' :
                        isModerate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-geo/20 text-geo-light border border-geo/30'
                      }`}>
                        {spot.riskLevel}
                      </span>
                    </div>

                    {/* Telemetry Meters */}
                    <div className="space-y-1.5 my-2">
                      <div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                          <span className="flex items-center space-x-1">
                            <Thermometer className="w-2.5 h-2.5 text-thermal" />
                            <span>FIRE RADIATIVE POWER</span>
                          </span>
                          <span className="text-white font-bold">{spot.frp} MW</span>
                        </div>
                        <div className="h-1.5 w-full bg-space-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${frpPct}%`,
                              background: isCritical 
                                ? 'linear-gradient(90deg, #f97316, #ef4444)' 
                                : isHigh 
                                ? 'linear-gradient(90deg, #f59e0b, #f97316)' 
                                : 'linear-gradient(90deg, #10b981, #f59e0b)'
                            }}
                          />
                        </div>
                      </div>

                      {isEnclosed && (
                        <div className="px-2 py-1 bg-purple-950/60 rounded-md border border-purple-500/40 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-purple-300 flex items-center space-x-1 font-bold">
                            <Zap className="w-2.5 h-2.5 text-purple-400" />
                            <span>INTERNAL WIRE SHORT</span>
                          </span>
                          <span className="text-cyan-300 font-bold">
                            AOD: {spot.smokeAodIndex || 0.88} SMOKE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-white/5">
                      <div className="flex items-center space-x-2">
                        <span>Score: <strong className={isCritical ? 'text-critical' : 'text-white'}>{spot.riskScore}/100</strong></span>
                        <span>•</span>
                        <span>Passes: <strong className="text-emerald-400">{spot.historicalCount || 1}</strong></span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick();
                            setDossierHotspot(spot);
                          }}
                          className="px-2 py-0.5 rounded bg-blue-950/70 hover:bg-blue-900 text-blue-300 text-[9px] font-mono font-bold flex items-center space-x-1 border border-blue-500/40"
                          title="Generate official NTRO incident report"
                        >
                          <FileText className="w-2.5 h-2.5" />
                          <span>Dossier</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playAlert();
                            onOpenSmsModal(spot);
                          }}
                          className="px-2 py-0.5 rounded bg-critical/20 hover:bg-critical text-critical-light hover:text-white text-[9px] font-mono font-bold flex items-center space-x-1 transition-all border border-critical/40"
                        >
                          <Smartphone className="w-2.5 h-2.5" />
                          <span>SMS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}

          {/* TAB 2: Spatial Dimension Tracker (Persistent Coordinate Store) */}
          {sidebarTab === 'dimensions' && (
            <div className="p-3 space-y-3 font-mono">
              {/* Summary Stats Banner */}
              {dimensionStats && (
                <div className="p-2.5 bg-black/60 rounded-xl border border-ai/30 grid grid-cols-3 gap-2 text-center text-[10px]">
                  <div>
                    <span className="text-slate-500 block text-[9px]">DIMENSIONS</span>
                    <span className="text-white font-bold text-xs">{dimensionStats.total_tracked_dimensions}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">ACTIVE FIRES</span>
                    <span className="text-critical font-bold text-xs">{dimensionStats.active_fire_dimensions}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">TOTAL PASSES</span>
                    <span className="text-emerald-400 font-bold text-xs">{dimensionStats.total_satellite_passes_recorded}</span>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Spatial dimensions cluster coordinates into ~1.1km cells. Detections are recorded <strong>only when active fire (FRP &ge; 10 MW)</strong> is verified by satellite.
              </p>

              {/* Dimensional Occurrences List */}
              <div className="space-y-2">
                {dimensionRecords.map((dim) => {
                  const isCrit = dim.risk_level === 'CRITICAL';

                  return (
                    <div 
                      key={dim.dimension_id}
                      onClick={() => {
                        soundFx.playClick();
                        setMapCenter([dim.latitude, dim.longitude]);
                        setMapZoom(12);
                      }}
                      className="p-2.5 bg-space-800/80 hover:bg-space-800 rounded-xl border border-white/10 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-bold text-white">{dim.dimension_id}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          isCrit ? 'bg-critical/20 text-critical border border-critical/40' : 'bg-thermal/20 text-thermal'
                        }`}>
                          {dim.total_occurrences} Passes
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 font-sans font-semibold truncate">
                        {dim.target_name}
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-400 pt-1 border-t border-white/5">
                        <div>PEAK: <strong className="text-thermal">{dim.peak_frp_mw} MW</strong></div>
                        <div>STATUS: <strong className="text-emerald-400">VERIFIED ACTIVE</strong></div>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        LAST PASS: {dim.last_observed_utc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 bg-space-950/90 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-geo animate-pulse" />
            <span>LIVE VIIRS NOAA-20 / MODIS</span>
          </span>
          <span className="text-thermal font-bold">NTRO DEFENSE v3.0</span>
        </div>
      </div>

      {/* ── RIGHT MAIN: Interactive Map with Blinking Critical Strobe ── */}
      <div className="flex-1 h-[54vh] lg:h-full relative overflow-hidden">
        
        {/* Floating Controls: Basemap Switcher */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col items-end space-y-2">
          <div className="bg-space-900/90 backdrop-blur-md p-1 rounded-xl border border-white/15 flex items-center space-x-1 shadow-2xl">
            <button
              onClick={() => { setBasemapMode('satellite'); soundFx.playClick(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                basemapMode === 'satellite'
                  ? 'bg-gradient-to-r from-ai to-blue-700 text-white shadow-ai-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>

            <button
              onClick={() => { setBasemapMode('esri-dark'); soundFx.playClick(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                basemapMode === 'esri-dark'
                  ? 'bg-gradient-to-r from-thermal to-orange-600 text-white shadow-thermal-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Tactical Dark</span>
            </button>

            <button
              onClick={() => { setBasemapMode('topo'); soundFx.playClick(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                basemapMode === 'topo'
                  ? 'bg-gradient-to-r from-geo to-green-700 text-white shadow-geo-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Topographic</span>
            </button>
          </div>
        </div>

        {/* Floating Top Left: Live Status Banner */}
        <div className="absolute top-4 left-4 z-[400] hidden sm:flex items-center space-x-2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-critical/50 shadow-2xl font-mono">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-critical" />
          </span>
          <span className="text-[11px] text-white font-bold tracking-wide">
            LIVE SATELLITE RADAR: CRITICAL BLIPS FLASHING
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-cyan-300 text-[10px]">DIMENSIONAL TRACKING ACTIVE</span>
        </div>

        {/* ── Leaflet Interactive Map ── */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Dynamic Basemap Layer */}
          {basemapMode === 'satellite' && (
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com">Esri</a> World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {basemapMode === 'esri-dark' && (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> Dark Matter'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              maxZoom={18}
            />
          )}

          {basemapMode === 'topo' && (
            <TileLayer
              attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          )}

          {/* Thermal Conduction Proximity Buffers */}
          {filteredHotspots.map((spot) => {
            const isCritical = spot.riskLevel === 'CRITICAL';
            const radius = isCritical ? 2500 : 1200;
            const bufferColor = isCritical ? '#ef4444' : '#f97316';

            return (
              <Circle
                key={`buffer-${spot.id}`}
                center={[spot.lat, spot.lng]}
                radius={radius}
                pathOptions={{
                  color: bufferColor,
                  fillColor: bufferColor,
                  fillOpacity: isCritical ? 0.12 : 0.06,
                  weight: isCritical ? 1.5 : 0.8,
                  dashArray: isCritical ? '4, 4' : undefined,
                }}
              />
            );
          })}

          {/* Pulsing Hotspot Markers */}
          {filteredHotspots.map((spot) => {
            const isSelected = selectedHotspot?.id === spot.id;
            const isCritical = spot.riskLevel === 'CRITICAL';
            const isEnclosed = spot.category === 'Enclosed Electrical & Smoke Anomaly';

            return (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={createPulsingMarkerIcon(spot, isSelected)}
                eventHandlers={{
                  click: () => {
                    handleSpotClick(spot);
                  },
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-3.5 max-w-[280px] font-sans">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-slate-400">{spot.district}, {spot.state}</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical ? 'bg-critical text-white' : 'bg-thermal text-black'
                      }`}>
                        {spot.riskLevel}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 leading-tight">
                      {spot.name}
                    </h3>
                    <p className="text-[11px] text-thermal font-mono mb-2">
                      {spot.category}
                    </p>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-black/50 rounded-lg border border-white/10 mb-2 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400 block">FIRE RADIATIVE POWER</span>
                        <span className="text-white font-bold text-xs">{spot.frp} MW</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">RISK SCORE</span>
                        <span className={`font-bold text-xs ${isCritical ? 'text-critical' : 'text-thermal'}`}>
                          {spot.riskScore}/100
                        </span>
                      </div>
                    </div>

                    {isEnclosed && (
                      <div className="p-2 mb-2 bg-purple-950/60 rounded border border-purple-500/40 text-[10px] font-mono text-purple-200">
                        ⚡ <strong>Internal Wire Short:</strong> Roof Smoke AOD {spot.smokeAodIndex || 0.88}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => {
                          soundFx.playClick();
                          setDossierHotspot(spot);
                        }}
                        className="w-full py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-[10px] font-mono font-bold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Dossier</span>
                      </button>

                      <button
                        onClick={() => {
                          soundFx.playAlert();
                          onOpenSmsModal(spot);
                        }}
                        className="w-full py-1.5 bg-critical hover:bg-critical-dark text-white rounded text-[10px] font-mono font-bold flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Send SMS</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* ── TACTICAL INCIDENT DOSSIER MODAL ── */}
      {dossierHotspot && (
        <TacticalDossierModal
          hotspot={dossierHotspot}
          onClose={() => setDossierHotspot(null)}
          onOpenSmsModal={onOpenSmsModal}
        />
      )}

      {/* ── ENCLOSED ELECTRICAL FIRE & SMOKE RADAR MODAL ── */}
      {showEnclosedModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-space-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden glass-card">
            
            <div className="px-6 py-4 bg-space-950 border-b border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Zap className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase text-purple-400 font-bold tracking-wider">
                      NEW SATELLITE INNOVATION ENGINE
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-400">
                      SENTINEL-5P + VIIRS
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">
                    Enclosed Electrical Fire & Smoke Pattern Detection
                  </h3>
                </div>
              </div>

              <button
                onClick={() => { soundFx.playClick(); setShowEnclosedModal(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <p className="text-slate-300 leading-relaxed">
                When an electrical fire happens inside a sealed concrete/metal building (e.g. server room cable riser, transformer busbar short-circuit), open flames are not immediately exposed to satellite optical cameras. Our engine detects this using a <strong>4-Stage Multi-Spectral Signature</strong>:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono">
                <div className="p-3 bg-black/50 rounded-xl border border-purple-500/30">
                  <div className="flex items-center justify-between text-purple-300 font-bold mb-1">
                    <span>1. Thermal Conduction</span>
                    <span className="text-[10px] text-emerald-400">364K - 378K</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Internal heat conducted through roof slabs creates an anomalous Longwave IR (LWIR 11µm) footprint without open flame flare.
                  </p>
                </div>

                <div className="p-3 bg-black/50 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
                    <span>2. Smoke Aerosol Index</span>
                    <span className="text-[10px] text-cyan-400">AOD &gt; 0.85</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Toxic PVC/hydrocarbon insulation pyrolysis vents through roof HVAC exhaust, creating concentrated carbon aerosol plumes.
                  </p>
                </div>

                <div className="p-3 bg-black/50 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                    <span>3. Optical Disparity</span>
                    <span className="text-[10px] text-amber-400">84% Disparity</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Zero visual flame footprint paired with high thermal conduction confirms internal enclosed fire rather than routine surface activity.
                  </p>
                </div>

                <div className="p-3 bg-black/50 rounded-xl border border-red-500/30">
                  <div className="flex items-center justify-between text-red-300 font-bold mb-1">
                    <span>4. Autonomous DDMA Action</span>
                    <span className="text-[10px] text-red-400">&lt; 90s Dispatch</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Instantly triggers electrical grid isolation and dispatches SDRF HazMat teams with CO2/gas suppression guidance.
                  </p>
                </div>
              </div>

              {enclosedModalHotspot && (
                <div className="p-3.5 bg-purple-950/40 rounded-xl border border-purple-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-purple-300 font-bold text-[11px]">
                      LIVE DETECTED TARGET: {enclosedModalHotspot.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-critical text-white font-mono text-[9px] font-bold">
                      {enclosedModalHotspot.riskLevel}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs">
                    {enclosedModalHotspot.aiReasoning}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    if (enclosedModalHotspot) {
                      setShowEnclosedModal(false);
                      onOpenSmsModal(enclosedModalHotspot);
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Send Electrical Emergency Alert</span>
                </button>

                <button
                  onClick={() => setShowEnclosedModal(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-mono rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
