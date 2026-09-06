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
  Globe2
} from 'lucide-react';
import type { Hotspot } from '../data/hotspots';
import { DEMO_HOTSPOTS } from '../data/hotspots';
import { fetchLiveFirmsAnomalies } from '../services/api';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [minFRP, setMinFRP] = useState<number>(0);
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(false);
  
  // Basemap switcher: 'satellite' | 'esri-dark' | 'topo'
  const [basemapMode, setBasemapMode] = useState<'satellite' | 'esri-dark' | 'topo'>('satellite');
  
  // Map positioning (Default: Pan-India National Command View)
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  // Live NASA FIRMS data state
  const [isSyncingFirms, setIsSyncingFirms] = useState<boolean>(false);
  const [liveSatelliteAnomalies, setLiveSatelliteAnomalies] = useState<Hotspot[]>([]);
  const [firmsSyncCount, setFirmsSyncCount] = useState<number | null>(null);

  const categories = [
    'ALL',
    'Industrial Fire',
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

  // Trigger live satellite downlink from backend with user's NASA FIRMS key
  const handleSyncLiveFirms = async () => {
    setIsSyncingFirms(true);
    soundFx.playAlert();
    try {
      const data = await fetchLiveFirmsAnomalies('IND', 3);
      if (data && data.anomalies && data.anomalies.length > 0) {
        soundFx.playSuccess();
        setFirmsSyncCount(data.anomalies.length);
        
        // Transform live NASA detections into Hotspot format
        const converted = data.anomalies.slice(0, 30).map((anom: any, idx: number) => ({
          id: `NASA-FIRMS-${idx + 1}`,
          name: anom.target || `NASA Live Satellite Thermal Point #${idx + 1}`,
          location: `Lat ${anom.latitude.toFixed(3)}, Lng ${anom.longitude.toFixed(3)}`,
          district: 'India Sector',
          state: 'National Territory',
          region: 'All India' as const,
          lat: anom.latitude,
          lng: anom.longitude,
          frp: anom.frp || 120.0,
          brightnessTemp: anom.brightness || 360.0,
          confidence: anom.confidence === 'high' ? 98.2 : 88.5,
          category: (anom.frp > 300 ? 'Industrial Fire' : anom.frp > 150 ? 'Forest Fire' : 'Agricultural Burning') as any,
          riskLevel: (anom.frp > 300 ? 'CRITICAL' : anom.frp > 150 ? 'HIGH' : 'MODERATE') as any,
          riskScore: Math.min(96, Math.max(35, Math.round((anom.frp || 100) / 4))),
          nearbyIndustry: 'NASA Earth Observation FIRMS Downlink',
          distanceToIndustry: 350,
          historicalCount: 4,
          detectionTime: anom.acq_time || 'Recent Orbit Pass',
          satellite: anom.satellite || 'VIIRS NOAA-20',
          scanAngle: 10.5,
          landCover: 'Geospatial Radar Mesh',
          windSpeed: '14 km/h',
          recommendation: 'Autonomous satellite detection. Dispatched for field verification.',
          status: 'Active Flare' as const,
          aiReasoning: 'Real-time thermal anomaly detected by NASA VIIRS 375m sensor downlink.',
          shapValues: [
            { feature: 'Satellite Radiative Radiance', importance: 0.38, impact: 'positive' as const, description: `${anom.frp} MW measured by VIIRS I-Band` },
            { feature: 'Sensor Confidence Threshold', importance: 0.25, impact: 'positive' as const, description: `${anom.confidence} detection certainty` },
          ]
        }));

        setLiveSatelliteAnomalies(converted);
      }
    } catch (e) {
      console.warn('NASA FIRMS sync note:', e);
    } finally {
      setIsSyncingFirms(false);
    }
  };

  // Create custom pulsing SVG radar blips
  const createPulsingMarkerIcon = (hotspot: Hotspot, isSelected: boolean) => {
    const isCritical = hotspot.riskLevel === 'CRITICAL';
    const isHigh = hotspot.riskLevel === 'HIGH';
    const isModerate = hotspot.riskLevel === 'MODERATE';

    let color = '#16a34a';
    let pulseClass = 'pulse-marker-low';
    let ringColor = 'rgba(22, 163, 74, 0.4)';

    if (isCritical) {
      color = '#dc2626';
      pulseClass = 'pulse-marker-critical';
      ringColor = 'rgba(220, 38, 38, 0.6)';
    } else if (isHigh) {
      color = '#f97316';
      pulseClass = 'pulse-marker-high';
      ringColor = 'rgba(249, 115, 22, 0.6)';
    } else if (isModerate) {
      color = '#f59e0b';
      pulseClass = 'pulse-marker-moderate';
      ringColor = 'rgba(245, 158, 11, 0.5)';
    }

    const size = isSelected ? 38 : 28;
    const borderGlow = isSelected ? '4px solid #ffffff' : `2px solid ${color}`;

    const html = `
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
          box-shadow: 0 0 15px ${color};
          z-index: 10;
        ">
          <svg style="width: 12px; height: 12px; color: white; fill: currentColor;" viewBox="0 0 24 24">
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
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-[#050816] text-slate-100 overflow-hidden relative">
      
      {/* LEFT SIDEBAR: Real-Time Alerts Feed & Filters */}
      <div className="w-full lg:w-96 flex-shrink-0 bg-space-900/95 backdrop-blur-xl border-r border-white/10 flex flex-col z-20 shadow-2xl h-[42vh] lg:h-full">
        
        {/* Sidebar Header & Live Counter */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-thermal/20 text-thermal border border-thermal/30">
                <Flame className="w-4 h-4 animate-pulse" />
              </span>
              <div>
                <h2 className="text-sm font-bold tracking-wider text-white uppercase">
                  National Telemetry Feed
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">
                  {filteredHotspots.length} HOTSPOTS IN VIEW
                </span>
              </div>
            </div>

            <button
              onClick={handleSyncLiveFirms}
              disabled={isSyncingFirms}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-ai/20 hover:bg-ai/30 text-ai-light border border-ai/40 rounded-lg text-[10px] font-mono font-bold transition-all disabled:opacity-50"
              title="Downlink latest NASA VIIRS passes"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncingFirms ? 'animate-spin' : ''}`} />
              <span>{isSyncingFirms ? 'Syncing...' : 'Sync FIRMS'}</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search state, district, industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-space-800/80 border border-white/10 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-thermal/60 transition-colors"
            />
          </div>

          {/* Region Quick Selector */}
          <div className="mt-2.5">
            <label className="text-[10px] font-mono text-slate-400 block mb-1">TARGET REGION / SECTOR</label>
            <select
              value={selectedRegion}
              onChange={(e) => handleSelectRegion(e.target.value)}
              className="w-full px-2 py-1 bg-space-800 border border-white/10 rounded text-[11px] text-slate-200 focus:outline-none focus:border-ai"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Filter Row */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">CATEGORY</label>
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); soundFx.playClick(); }}
                className="w-full px-2 py-1 bg-space-800 border border-white/10 rounded text-[11px] text-slate-200 focus:outline-none focus:border-ai"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">RISK LEVEL</label>
              <select
                value={selectedRisk}
                onChange={(e) => { setSelectedRisk(e.target.value); soundFx.playClick(); }}
                className="w-full px-2 py-1 bg-space-800 border border-white/10 rounded text-[11px] text-slate-200 focus:outline-none focus:border-critical"
              >
                {riskLevels.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* FRP Slider */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>MIN FIRE RADIATIVE POWER</span>
              <span className="text-thermal font-bold">{minFRP} MW</span>
            </div>
            <input
              type="range"
              min="0"
              max="700"
              step="25"
              value={minFRP}
              onChange={(e) => setMinFRP(Number(e.target.value))}
              className="w-full h-1 bg-space-700 rounded-lg appearance-none cursor-pointer accent-thermal"
            />
          </div>
        </div>

        {/* Hotspots Alert List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
          {filteredHotspots.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No thermal hotspots match your filter criteria.
            </div>
          ) : (
            filteredHotspots.map((spot) => {
              const isSelected = selectedHotspot?.id === spot.id;
              const isCritical = spot.riskLevel === 'CRITICAL';
              const isHigh = spot.riskLevel === 'HIGH';
              const isModerate = spot.riskLevel === 'MODERATE';

              return (
                <div
                  key={spot.id}
                  onClick={() => handleSpotClick(spot)}
                  className={`p-3.5 transition-all cursor-pointer group hover:bg-white/5 ${
                    isSelected ? 'bg-thermal/15 border-l-4 border-thermal' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          isCritical ? 'bg-critical animate-ping' :
                          isHigh ? 'bg-thermal' :
                          isModerate ? 'bg-amber-400' : 'bg-geo'
                        }`} />
                        <h4 className="text-xs font-bold text-white group-hover:text-thermal transition-colors truncate">
                          {spot.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{spot.district}, {spot.state}</span>
                      </p>
                    </div>

                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      isCritical ? 'bg-critical/20 text-critical-light border border-critical/30' :
                      isHigh ? 'bg-thermal/20 text-thermal-light border border-thermal/30' :
                      isModerate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-geo/20 text-geo-light border border-geo/30'
                    }`}>
                      {spot.riskLevel}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div>
                      FRP: <span className="text-white font-bold">{spot.frp} MW</span>
                    </div>
                    <div>
                      Conf: <span className="text-ai-light font-bold">{spot.confidence}%</span>
                    </div>
                    <div>
                      Score: <span className={`font-bold ${isCritical ? 'text-critical' : isHigh ? 'text-thermal' : 'text-slate-300'}`}>
                        {spot.riskScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      {spot.nearbyIndustry}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playAlert();
                          onOpenSmsModal(spot);
                        }}
                        className="px-2 py-0.5 rounded bg-critical/20 hover:bg-critical text-critical-light hover:text-white text-[10px] font-mono font-bold flex items-center space-x-1 transition-all border border-critical/40 shadow-sm"
                        title="Dispatch instant SMS alert to mobile"
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>SMS</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          onSelectHotspot(spot);
                        }}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-thermal/20 hover:text-thermal text-slate-300 text-[10px] font-mono flex items-center space-x-1 transition-colors border border-white/5"
                      >
                        <Eye className="w-3 h-3 text-thermal" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 bg-space-950/80 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-geo animate-pulse" />
            <span>FIRMS DOWNLINK: SYNCED</span>
          </span>
          <span className="text-ai-light font-bold">ALL INDIA RADAR ACTIVE</span>
        </div>
      </div>

      {/* RIGHT MAIN: Interactive Leaflet Map */}
      <div className="flex-1 h-[58vh] lg:h-full relative overflow-hidden">
        
        {/* Floating Controls Top Right: Multi-Basemap Switcher & Heatmap Toggle */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col items-end space-y-2">
          
          {/* Basemap Switcher Pill Dock */}
          <div className="bg-space-900/90 backdrop-blur-md p-1 rounded-xl border border-white/15 flex items-center space-x-1 shadow-2xl">
            <button
              onClick={() => { setBasemapMode('satellite'); soundFx.playClick(); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                basemapMode === 'satellite'
                  ? 'bg-gradient-to-r from-ai to-blue-700 text-white shadow-ai-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="High-Resolution Orbital Satellite Imagery"
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
              title="Tactical Dark Gray Basemap with Crisp Labels"
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
              title="Topographic Terrain & Elevation Relief"
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Topographic</span>
            </button>
          </div>

          {/* Secondary Controls: Heatmap Mode & National Sync */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsHeatmapMode(!isHeatmapMode);
                soundFx.playClick();
              }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold backdrop-blur-md border shadow-lg transition-all ${
                isHeatmapMode 
                  ? 'bg-thermal text-white border-white/30 shadow-thermal-glow' 
                  : 'bg-space-900/90 text-slate-300 border-white/10 hover:bg-space-800'
              }`}
              title="Toggle Thermal Density Radiance Buffers"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Heatmap: {isHeatmapMode ? 'ON' : 'OFF'}</span>
            </button>

            {firmsSyncCount && (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{firmsSyncCount} Live FIRMS Points</span>
              </div>
            )}
          </div>
        </div>

        {/* Sector Quick Jump Floating Bar at Top Left */}
        <div className="absolute top-4 left-4 z-[400] hidden md:flex items-center space-x-1 bg-space-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/15 text-xs font-mono shadow-2xl">
          <span className="text-slate-400 px-2 flex items-center space-x-1 font-semibold">
            <Navigation className="w-3.5 h-3.5 text-thermal" />
            <span>SECTOR:</span>
          </span>
          <button
            onClick={() => handleSelectRegion('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${selectedRegion === 'ALL' ? 'bg-white/15 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            All India
          </button>
          <button
            onClick={() => handleSelectRegion('Tamil Nadu')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${selectedRegion === 'Tamil Nadu' ? 'bg-thermal text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Tamil Nadu
          </button>
          <button
            onClick={() => handleSelectRegion('Western India')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${selectedRegion === 'Western India' ? 'bg-ai text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Gujarat/MH
          </button>
          <button
            onClick={() => handleSelectRegion('Eastern India')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${selectedRegion === 'Eastern India' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Odisha/JH
          </button>
          <button
            onClick={() => handleSelectRegion('Northern India')}
            className={`px-2.5 py-1 rounded-lg transition-colors ${selectedRegion === 'Northern India' ? 'bg-geo text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Punjab/HR
          </button>
        </div>

        {/* Tactical Legend Box */}
        <div className="absolute bottom-4 left-4 z-[400] hidden sm:block bg-space-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs font-mono shadow-2xl">
          <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">
            Thermal Risk Classification
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-critical shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              <span className="text-slate-200">Critical Emergency (&gt;85)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-thermal shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              <span className="text-slate-200">High Risk Wildfire / Hazard (70-85)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span className="text-slate-200">Moderate Baseline Flare (40-69)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-geo shadow-[0_0_8px_rgba(22,163,74,0.8)]" />
              <span className="text-slate-200">Low Agro / Monitored Plant (&lt;40)</span>
            </div>
          </div>
        </div>

        {/* Actual Leaflet Map */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          {/* Dynamic Basemap Rendering */}
          {basemapMode === 'satellite' && (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {basemapMode === 'esri-dark' && (
            <>
              <TileLayer
                attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
              />
              <TileLayer
                attribution=''
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
                maxZoom={16}
              />
            </>
          )}

          {basemapMode === 'topo' && (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
              maxZoom={17}
            />
          )}

          {/* Heatmap Simulation Layer (Concentric glowing thermal radiance buffers) */}
          {isHeatmapMode && filteredHotspots.map((spot) => {
            const isCritical = spot.riskLevel === 'CRITICAL';
            const radius = Math.max(12000, spot.frp * 80);
            return (
              <React.Fragment key={`heat-${spot.id}`}>
                <Circle
                  center={[spot.lat, spot.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: isCritical ? '#dc2626' : '#f97316',
                    fillOpacity: 0.25,
                    color: 'transparent',
                  }}
                />
                <Circle
                  center={[spot.lat, spot.lng]}
                  radius={radius * 0.5}
                  pathOptions={{
                    fillColor: '#ef4444',
                    fillOpacity: 0.45,
                    color: 'transparent',
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Hotspot Markers */}
          {filteredHotspots.map((spot) => {
            const isSelected = selectedHotspot?.id === spot.id;
            return (
              <Marker
                key={spot.id}
                position={[spot.lat, spot.lng]}
                icon={createPulsingMarkerIcon(spot, isSelected)}
                eventHandlers={{
                  click: () => handleSpotClick(spot),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 max-w-[270px] text-xs">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                      <span className="font-mono text-[10px] text-slate-400">{spot.id}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        spot.riskLevel === 'CRITICAL' ? 'bg-critical text-white' :
                        spot.riskLevel === 'HIGH' ? 'bg-thermal text-white' :
                        spot.riskLevel === 'MODERATE' ? 'bg-amber-500 text-black' :
                        'bg-geo text-white'
                      }`}>
                        {spot.riskLevel}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm mb-1 leading-tight">
                      {spot.name}
                    </h4>

                    <p className="text-[11px] text-slate-300 mb-2">
                      {spot.location} • {spot.state}
                    </p>

                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-space-950/80 p-1.5 rounded mb-2 text-slate-300">
                      <div>FRP: <span className="text-thermal font-bold">{spot.frp} MW</span></div>
                      <div>Conf: <span className="text-ai-light font-bold">{spot.confidence}%</span></div>
                      <div>Risk: <span className="text-critical font-bold">{spot.riskScore}/100</span></div>
                      <div>Sens: <span className="text-white">{spot.satellite.split(' ')[0]}</span></div>
                    </div>

                    <div className="text-[10px] text-slate-400 mb-3 line-clamp-2">
                      <span className="text-slate-300 font-semibold">AI:</span> {spot.category} near {spot.nearbyIndustry}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playAlert();
                          onOpenSmsModal(spot);
                        }}
                        className="flex-1 py-1.5 px-2 bg-critical/20 hover:bg-critical text-critical-light hover:text-white rounded font-mono font-bold text-[11px] flex items-center justify-center space-x-1 transition-all border border-critical/40"
                        title="Transmit emergency SMS to a phone number"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Send SMS</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playClick();
                          onSelectHotspot(spot);
                        }}
                        className="flex-1 py-1.5 px-2 bg-gradient-to-r from-thermal to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded font-mono font-bold text-[11px] flex items-center justify-center space-x-1 shadow-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

    </div>
  );
};
