import React, { useEffect, useRef } from 'react';
import { 
  Satellite, 
  Flame, 
  BrainCircuit, 
  ShieldAlert, 
  ArrowRight, 
  Crosshair, 
  MapPin, 
  Activity, 
  Layers, 
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Radar,
  FileText
} from 'lucide-react';
import { SATELLITE_TELEMETRY_STATS, DEMO_HOTSPOTS } from '../data/hotspots';
import { soundFx } from '../utils/audio';

interface HeroSectionProps {
  onLaunchDashboard: () => void;
  onExploreShap: () => void;
  onViewDossier: () => void;
  onSelectHotspot: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchDashboard,
  onExploreShap,
  onViewDossier,
  onSelectHotspot
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Futuristic Satellite Orbital Animation on HTML Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle1 = 0;
    let angle2 = Math.PI * 0.6;
    let angle3 = Math.PI * 1.3;
    let pulseRadius = 0;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 800;
      canvas.height = 500;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const globeRadius = Math.min(centerX, centerY) * 0.48;

      // Glow behind Earth
      const glowGrad = ctx.createRadialGradient(centerX, centerY, globeRadius * 0.5, centerX, centerY, globeRadius * 1.6);
      glowGrad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
      glowGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.1)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Earth Globe Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#060d28';
      ctx.fill();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.clip();

      // Latitude lines
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.15)';
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        const y = centerY + (i * globeRadius) / 4;
        const r = Math.sqrt(Math.max(0, globeRadius * globeRadius - Math.pow(y - centerY, 2)));
        ctx.beginPath();
        ctx.ellipse(centerX, y, r, r * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude lines
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, globeRadius * (0.25 * (i + 1)), globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Simulated Indian Subcontinent Silhouette & Hotspots on globe
      const indiaX = centerX + globeRadius * 0.15;
      const indiaY = centerY + globeRadius * 0.08;

      // Pulsing Tamil Nadu Thermal Hotspot Cluster
      pulseRadius = (pulseRadius + 0.5) % 35;
      ctx.beginPath();
      ctx.arc(indiaX, indiaY, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(220, 38, 38, ${Math.max(0, 1 - pulseRadius / 35)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(indiaX, indiaY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      // Helper to draw satellite orbit
      const drawOrbit = (aX: number, aY: number, rot: number, color: string) => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, aX, aY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      };

      // Orbit 1: Polar VIIRS Orbit
      drawOrbit(globeRadius * 1.5, globeRadius * 0.75, Math.PI / 4, 'rgba(59, 130, 246, 0.3)');
      // Orbit 2: Equatorial MODIS Orbit
      drawOrbit(globeRadius * 1.35, globeRadius * 0.65, -Math.PI / 5, 'rgba(249, 115, 22, 0.3)');
      // Orbit 3: Geostationary INSAT-3DR Orbit
      drawOrbit(globeRadius * 1.7, globeRadius * 0.85, 0.05, 'rgba(34, 197, 94, 0.3)');

      // Draw Satellite 1: VIIRS NOAA-20
      const sat1OrbitX = globeRadius * 1.5;
      const sat1OrbitY = globeRadius * 0.75;
      const rot1 = Math.PI / 4;
      const localX1 = Math.cos(angle1) * sat1OrbitX;
      const localY1 = Math.sin(angle1) * sat1OrbitY;
      const s1X = centerX + localX1 * Math.cos(rot1) - localY1 * Math.sin(rot1);
      const s1Y = centerY + localX1 * Math.sin(rot1) + localY1 * Math.cos(rot1);

      // Radar Scan Cone from Satellite 1 down to Earth
      ctx.save();
      const gradCone = ctx.createLinearGradient(s1X, s1Y, indiaX, indiaY);
      gradCone.addColorStop(0, 'rgba(249, 115, 22, 0.7)');
      gradCone.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.beginPath();
      ctx.moveTo(s1X, s1Y);
      ctx.lineTo(indiaX - 25, indiaY + 15);
      ctx.lineTo(indiaX + 25, indiaY - 15);
      ctx.closePath();
      ctx.fillStyle = gradCone;
      ctx.fill();

      // Satellite Body 1
      ctx.beginPath();
      ctx.arc(s1X, s1Y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();

      // Satellite Solar Panels
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s1X - 10, s1Y);
      ctx.lineTo(s1X + 10, s1Y);
      ctx.stroke();

      // Satellite Label
      ctx.fillStyle = '#bae6fd';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('VIIRS NOAA-20 (375m)', s1X + 10, s1Y - 8);
      ctx.restore();

      // Draw Satellite 2: MODIS AQUA
      const sat2OrbitX = globeRadius * 1.35;
      const sat2OrbitY = globeRadius * 0.65;
      const rot2 = -Math.PI / 5;
      const localX2 = Math.cos(angle2) * sat2OrbitX;
      const localY2 = Math.sin(angle2) * sat2OrbitY;
      const s2X = centerX + localX2 * Math.cos(rot2) - localY2 * Math.sin(rot2);
      const s2Y = centerY + localX2 * Math.sin(rot2) + localY2 * Math.cos(rot2);

      ctx.save();
      ctx.beginPath();
      ctx.arc(s2X, s2Y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fb923c';
      ctx.shadowColor = '#fb923c';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.fillStyle = '#fdba74';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('MODIS AQUA (1km)', s2X + 8, s2Y + 12);
      ctx.restore();

      // Draw Satellite 3: INSAT-3DR
      const sat3OrbitX = globeRadius * 1.7;
      const sat3OrbitY = globeRadius * 0.85;
      const rot3 = 0.05;
      const localX3 = Math.cos(angle3) * sat3OrbitX;
      const localY3 = Math.sin(angle3) * sat3OrbitY;
      const s3X = centerX + localX3 * Math.cos(rot3) - localY3 * Math.sin(rot3);
      const s3Y = centerY + localX3 * Math.sin(rot3) + localY3 * Math.cos(rot3);

      ctx.save();
      ctx.beginPath();
      ctx.arc(s3X, s3Y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#4ade80';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('INSAT-3DR (GEO-MET)', s3X + 8, s3Y - 8);
      ctx.restore();

      angle1 += 0.007;
      angle2 += 0.005;
      angle3 += 0.003;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative overflow-hidden bg-grid-pattern pt-8 pb-20">
      {/* Radial Glow Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-blue-900/20 via-thermal/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges & Organization Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-space-800/90 border border-thermal/30 text-thermal-light text-xs font-mono font-medium shadow-thermal-glow">
            <span className="w-2 h-2 rounded-full bg-thermal animate-ping" />
            <span>SMART INDIA HACKATHON 2026 // GRAND FINALE</span>
          </div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-space-800/90 border border-ai/40 text-ai-light text-xs font-mono font-medium shadow-ai-glow">
            <span className="w-2 h-2 rounded-full bg-ai" />
            <span>PROBLEM STATEMENT: SIH26162</span>
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-space-800/90 border border-white/10 text-slate-300 text-xs font-mono">
            <span>MINISTRY:</span>
            <span className="text-white font-bold tracking-wider">NTRO (National Technical Research Org)</span>
          </div>
        </div>

        {/* Hero Main Header */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
            Industrial Thermal <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-thermal via-orange-400 to-amber-300 drop-shadow-[0_0_35px_rgba(249,115,22,0.4)]">
              Intelligence
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            AI-Powered Geospatial Classification and Risk Prioritization of Satellite Thermal Hotspots. 
            Distinguish routine industrial emissions from catastrophic fires and wildfire hazards in under 90 seconds.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => { soundFx.playAlert(); onLaunchDashboard(); }}
              className="group relative inline-flex items-center space-x-3 px-8 py-4 rounded-xl text-sm sm:text-base font-bold uppercase tracking-wider text-white bg-gradient-to-r from-thermal via-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-thermal-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Crosshair className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '6s' }} />
              <span>Launch Command Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => { soundFx.playClick(); onExploreShap(); }}
              className="inline-flex items-center space-x-2 px-6 py-4 rounded-xl text-sm sm:text-base font-semibold text-slate-200 bg-space-800/80 hover:bg-space-700/80 border border-white/15 hover:border-ai/50 shadow-lg transition-all"
            >
              <BrainCircuit className="w-5 h-5 text-ai-light" />
              <span>Explore SHAP Explainability</span>
            </button>

            <button
              onClick={() => { soundFx.playClick(); onViewDossier(); }}
              className="inline-flex items-center space-x-2 px-6 py-4 rounded-xl text-sm sm:text-base font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span>Project Architecture</span>
            </button>
          </div>
        </div>

        {/* Live Satellite Orbital Canvas */}
        <div className="mt-10 relative max-w-4xl mx-auto rounded-2xl glass-card border border-white/15 overflow-hidden shadow-2xl">
          <div className="absolute top-3 left-4 z-10 flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Radar className="w-4 h-4 text-thermal animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-white font-semibold">ORBITAL PASS RECONNAISSANCE</span>
            <span className="text-slate-500">|</span>
            <span className="text-geo-light">VIIRS / MODIS / INSAT INGESTION</span>
          </div>

          <div className="absolute top-3 right-4 z-10 hidden sm:flex items-center space-x-2 text-[11px] font-mono text-cyan-400 bg-black/40 px-2.5 py-1 rounded border border-cyan-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SECTOR: 11.1271° N, 78.6569° E [TN]</span>
          </div>

          <canvas ref={canvasRef} className="w-full h-[400px] sm:h-[460px] block cursor-crosshair" />

          {/* Canvas Bottom Ticker */}
          <div className="p-3 bg-space-950/90 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-thermal font-bold">LATEST HOTSPOT:</span>
              <span className="text-white font-medium">Tiruppur SIDCO (342.8 MW - CRITICAL INDUSTRIAL)</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-geo-light flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Geospatial Buffer: 500m Matched</span>
              </span>
              <span className="text-ai-light">XGBoost Inference: 84ms</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Statistics Cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>ACTIVE SATELLITES</span>
              <Satellite className="w-4 h-4 text-ai-light" />
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {SATELLITE_TELEMETRY_STATS.activeSatellites} <span className="text-xs text-geo-light font-normal">CONSTELLATIONS</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">VIIRS (375m), MODIS & INSAT-3DR</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-ai to-transparent" />
          </div>

          <div className="glass-card p-5 rounded-xl border border-critical/30 relative overflow-hidden bg-critical/5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>CRITICAL ALERTS</span>
              <Flame className="w-4 h-4 text-critical animate-pulse" />
            </div>
            <div className="mt-2 text-3xl font-black text-critical font-mono">
              0{SATELLITE_TELEMETRY_STATS.criticalAlertsCount} <span className="text-xs text-slate-300 font-normal">EMERGENCY TIERS</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Tiruppur Boiler, Cuddalore Chemical</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-critical to-transparent" />
          </div>

          <div className="glass-card p-5 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>ML ACCURACY</span>
              <Cpu className="w-4 h-4 text-geo-light" />
            </div>
            <div className="mt-2 text-3xl font-black text-geo-light font-mono">
              {SATELLITE_TELEMETRY_STATS.overallAccuracyPct}%
            </div>
            <p className="mt-1 text-[11px] text-slate-400">XGBoost + TreeSHAP Spatial Ensemble</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-geo to-transparent" />
          </div>

          <div className="glass-card p-5 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
              <span>TRIAGE LATENCY</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-amber-300 font-mono">
              &lt; 90s <span className="text-xs text-slate-300 font-normal">INGEST TO DISPATCH</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Automated DDMA & NDRF routing</p>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-transparent" />
          </div>
        </div>

        {/* Demo Hotspots Showcase (Tamil Nadu Focus) */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-thermal uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>Operational Demonstration Targets</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                Tamil Nadu Strategic Hotspots
              </h2>
            </div>
            <button
              onClick={() => { soundFx.playClick(); onLaunchDashboard(); }}
              className="mt-3 sm:mt-0 text-xs font-mono text-slate-300 hover:text-thermal flex items-center space-x-1"
            >
              <span>View all on Command Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEMO_HOTSPOTS.slice(0, 8).map((spot) => {
              const isCritical = spot.riskLevel === 'CRITICAL';
              const isHigh = spot.riskLevel === 'HIGH';
              const isModerate = spot.riskLevel === 'MODERATE';

              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    soundFx.playClick();
                    onSelectHotspot(spot.id);
                  }}
                  className={`glass-card p-4 rounded-xl border transition-all cursor-pointer group hover:scale-[1.02] ${
                    isCritical 
                      ? 'border-critical/40 hover:border-critical hover:shadow-critical-glow' 
                      : isHigh 
                      ? 'border-thermal/40 hover:border-thermal hover:shadow-thermal-glow'
                      : isModerate
                      ? 'border-amber-500/30 hover:border-amber-400'
                      : 'border-geo/30 hover:border-geo'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">{spot.district}, TN</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      isCritical ? 'bg-critical/20 text-critical-light border border-critical/40' :
                      isHigh ? 'bg-thermal/20 text-thermal-light border border-thermal/40' :
                      isModerate ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-geo/20 text-geo-light border border-geo/40'
                    }`}>
                      {spot.riskLevel}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-thermal transition-colors line-clamp-1">
                    {spot.name.split('–')[0]}
                  </h3>
                  <div className="mt-1 text-xs text-slate-300 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>{spot.category}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                    <div className="text-slate-400">
                      FRP: <span className="text-white font-bold">{spot.frp} MW</span>
                    </div>
                    <div className="text-slate-400">
                      Risk: <span className={`font-bold ${isCritical ? 'text-critical-light' : isHigh ? 'text-thermal-light' : 'text-slate-200'}`}>
                        {spot.riskScore}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="p-3 w-12 h-12 rounded-xl bg-ai/10 border border-ai/30 flex items-center justify-center text-ai-light mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Geospatial Sensor Fusion</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Automated ingestion from NASA FIRMS (VIIRS 375m I-Band, MODIS 1km) fused with ISRO INSAT-3DR geostationary imagery and OpenStreetMap industrial land registry layers.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="p-3 w-12 h-12 rounded-xl bg-thermal/10 border border-thermal/30 flex items-center justify-center text-thermal mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">XGBoost & SHAP Attribution</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Ensemble gradient boosted trees trained on 50,000+ historical anomalies with TreeSHAP local attribution bars, explaining why every hotspot is classified with mathematical transparency.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10">
            <div className="p-3 w-12 h-12 rounded-xl bg-critical/10 border border-critical/30 flex items-center justify-center text-critical-light mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Automated Defense Triage</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Dynamic risk index (0–100) scoring severity using distance-to-hazmat buffers, population settlement density, wind vectors, and persistence recurrence, dispatching instant notifications to DDMA.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
